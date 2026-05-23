import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

//Text based AI Chat Message Controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });
    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Image Generation Message Controller (Powered by Pollinations.ai & ImageKit Storage)
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check Credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }
    const { prompt, chatId, isPublished } = req.body;

    // Find Chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    // Push user messages
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode the prompt safely for URL transmission
    const encodedPrompt = encodeURIComponent(prompt);

    // 🌟 FIX: Standard URL string concatenation to prevent getaddrinfo formatting errors
    const generatedImageUrl =
      "https://image.pollinations.ai/prompt/" +
      encodedPrompt +
      "?width=800&height=800&nologo=true&enhance=true";

    // Trigger generation by fetching from Pollinations.ai
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // Convert generated image buffer to Base64 (Pollinations outputs optimized JPEG data streams)
    const base64Image = `data:image/jpeg;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Generate a clean slug for storage naming in your Media library
    const urlSafeSlug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);

    // Upload the free image to ImageKit for permanent static hosting (0 Extension Units used!)
    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `${urlSafeSlug}-${Date.now()}.jpg`,
      folder: "promptlyai",
    });

    // Create AI reply object
    const reply = {
      role: "assistant",
      content: uploadResponse.url, // Serves the permanent static ImageKit CDN link to your UI
      timestamp: Date.now(),
      isImage: true,
      isPublished,
      userName: req.user.name,
    };

    // Send response to frontend
    res.json({
      success: true,
      reply,
    });

    // Save AI reply to chat
    chat.messages.push(reply);
    await chat.save();

    // Deduct 2 credits for image generation
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    // Decodes raw error buffers into readable text string
    const errorDetail =
      error.response?.data instanceof Buffer
        ? error.response.data.toString()
        : error.response?.data || error.message;

    console.error("AI Generation Error Details:", errorDetail);
    res.json({
      success: false,
      message: "Failed to generate image. Please try again.",
    });
  }
};
