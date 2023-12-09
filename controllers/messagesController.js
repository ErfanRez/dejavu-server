const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

// @desc Get an unique message
// @route GET /messages/:id
//! @access Public
const getMessageById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Message ID Required!" });
  }

  //? Does the message exist?
  const message = await prismadb.message.findUnique({
    where: {
      id,
    },
  });

  if (!message) {
    return res.status(404).json({ message: "Message not found!" });
  }

  res.json(message);
};

//! @access Public
const getAllMessages = async (req, res) => {
  //* Get all messages from DB

  const messages = await prismadb.message.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no messages

  if (!messages?.length) {
    return res.status(404).json({ message: "No messages found" });
  }

  res.json(messages);
};

// @desc Create new message
// @route POST /messages
//! @access Private
const createNewMessage = async (req, res) => {
  const { name, phone, email, text } = req.body;

  //* Confirm data

  if (!name || !email || !text) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //* Create new message

  const message = await prismadb.message.create({
    data: {
      name,
      phone,
      email,
      text,
    },
  });

  if (message) {
    //*created

    res.status(201).json({ message: "New message created." });
  } else {
    res.status(400).json({ message: "Invalid data received!" });
  }
};

// @desc Delete messages
// @route DELETE /messages
//! @access Private
const deleteMessages = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Messages IDs required!" });
  }

  //? Does the messages exist to delete?
  const messages = await prismadb.message.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!messages) {
    return res.status(404).json({ message: "Messages not found!" });
  }

  await prismadb.message.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Messages deleted.",
  });
};

module.exports = {
  getMessageById,
  getAllMessages,
  createNewMessage,
  deleteMessages,
};
