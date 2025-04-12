const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Article = require("../models/Article");

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in uploads/ folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// 📝 Submit article with AI analysis
router.post("/", upload.single("media"), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("File Info:", req.file);

    const { title, content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newArticle = new Article({
      title,
      content,
      mediaUrl,
      status: "pending",
      createdAt: new Date(),
    });
    await newArticle.save();

    let textResult = {};
    try {
      const textScan = await axios.post("http://0.0.0.0:8001/verify-news", { text: content });
      textResult = {
        label: textScan.data.label || "Analyzing...",
        confidence: textScan.data.confidence || 0,
        details: textScan.data.details || {}
      };
      console.log("Text Analysis Response:", textResult);
    } catch (err) {
      console.error("Error during text scan:", err.message);
      textResult = {
        label: "Analysis Error",
        confidence: 0,
        details: { error: err.message }
      };
    }

    let mediaResult = { label: "No Media Uploaded", confidence: 0 };

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      const formData = new FormData();
      const fileStream = fs.createReadStream(req.file.path);

      try {
        if (["jpg", "jpeg", "png"].includes(fileExt)) {
          formData.append("image", fileStream);
          const imageScan = await axios.post("http://0.0.0.0:8000/predict-image", formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
          
          console.log("Raw Image Analysis Response:", imageScan.data);
          
          // Handle the specific response format from your model
          if (imageScan.data && imageScan.data.result) {
            // Extract scores from the nested result object
            const fakeScore = imageScan.data.result.Fake || 0;
            const realScore = imageScan.data.result.Real || 0;
            
            mediaResult = {
              label: fakeScore > realScore ? "Manipulated Image" : "Authentic Image",
              confidence: Math.max(fakeScore, realScore) * 100,
              details: {
                fakeScore: fakeScore,
                realScore: realScore
              }
            };

            // If fake score is very high, mark as manipulated
            if (fakeScore > 0.8) {
              mediaResult.label = "Manipulated Image (High Confidence)";
            }

            // Ensure mediaResult reflects the actual scores
            mediaResult.details = {
              fakeScore: fakeScore,
              realScore: realScore
            };
          }
          console.log("Processed Media Result:", mediaResult);
        } else if (["mp4", "mov", "avi"].includes(fileExt)) {
          formData.append("file", fileStream);
          const videoScan = await axios.post("http://0.0.0.0:8003/detect", formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
          
          if (videoScan.data) {
            mediaResult = {
              label: videoScan.data.deepfake_detected ? "Manipulated Video" : "Authentic Video",
              confidence: videoScan.data.confidence || 0,
              details: {
                frameAnalysis: videoScan.data.frame_analysis || {},
                detectionTime: videoScan.data.detection_time || 0
              }
            };
          }
          console.log("Video Analysis Response:", videoScan.data);
        }
      } catch (err) {
        console.error("Error during media scan:", err.message);
        mediaResult = {
          label: "Analysis Error",
          confidence: 0,
          details: { error: err.message }
        };
      }
    }

    // Initialize status as pending
    let status = "pending";

    // Determine final status based on analysis results - Stricter approach
    if (
      // Media checks - check actual scores from result
      (mediaResult.details && mediaResult.details.fakeScore > 0.5) || // Significant fake score
      mediaResult.label.toLowerCase().includes("manipulated") ||
      // Text checks
      (textResult.label && 
       textResult.label.toLowerCase().includes("fake") && 
       textResult.label !== "Analyzing...") // Don't reject if still analyzing
    ) {
      status = "rejected";
      console.log("Rejecting article due to:", {
        mediaFakeScore: mediaResult.details?.fakeScore,
        mediaLabel: mediaResult.label,
        textLabel: textResult.label
      });
    } else if (
      // Only approve if we have results and they show no issues
      textResult.label !== "Analyzing..." &&
      !mediaResult.label.toLowerCase().includes("error") && 
      !textResult.label.toLowerCase().includes("error") &&
      !mediaResult.label.toLowerCase().includes("manipulated") &&
      !textResult.label.toLowerCase().includes("fake") &&
      (mediaResult.details?.realScore > mediaResult.details?.fakeScore)
    ) {
      status = "approved";
      console.log("Approving content - no manipulation detected");
    } else {
      // Keep as pending if still analyzing or unclear
      status = "pending";
      console.log("Keeping as pending - analysis incomplete or unclear");
    }

    console.log("Final Status Decision:", {
      textLabel: textResult.label,
      mediaLabel: mediaResult.label,
      mediaScores: mediaResult.details,
      finalStatus: status
    });

    newArticle.status = status;
    newArticle.analysisResults = {
      text: textResult,
      media: mediaResult
    };
    await newArticle.save();

    const response = {
      message: "Article submitted successfully",
      articleId: newArticle._id,
      textAnalysis: {
        result: textResult.label,
        confidence: textResult.confidence,
        details: textResult.details
      },
      mediaAnalysis: {
        result: mediaResult.label,
        confidence: mediaResult.confidence,
        details: mediaResult.details
      },
      finalStatus: status
    };

    console.log("Sending response to frontend:", response);
    res.json(response);
  } catch (error) {
    console.error("Error processing article:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Fetch all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Trigger AI Scan (Placeholder)
router.get("/scan/:id", async (req, res) => {
  const { id } = req.params;
  res.json({ message: `Scan triggered for article ${id}` });
});

// ✅ Update article status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const article = await Article.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
