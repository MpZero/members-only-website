const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");

const validateMsg = [
  body("title").not().isEmpty().trim().isLength({ min: 1, max: 30 }),
  body("msg").not().isEmpty().trim().isLength({ min: 1, max: 250 }),
];

async function getMessages(req, res) {
  const user = req.user;

  try {
    let query;
    if (user && user.mem_status) {
      query = `
        SELECT messages_id, title, text, timestamp, username 
        FROM messages 
        JOIN users ON users.users_id = messages.user_id 
        ORDER BY timestamp DESC
      `;
    } else {
      query = `
        SELECT messages_id, title, text 
        FROM messages 
        ORDER BY messages_id DESC
      `;
    }

    const rows = await pool.query(query);
    const messages = rows.rows;

    res.render("messageBoard", {
      title: "Message Board",
      messages,
      username: user?.username || "",
      isMember: user?.mem_status || false,
      hasMessages: messages.length > 0,
    });
  } catch (error) {
    console.error("Error fetching messages: ", error);
    res.status(500).send("Error fetching messages");
  }
}

function getCreateMessage(req, res) {
  const username = req.user.username;

  res.render("addMsgForm", {
    title: "Create a New Message",
    username: username,
  });
}
const postCreateMessage = [
  validateMsg,
  async (req, res) => {
    const userId = req.user.users_id;
    const title = req.body.title;
    const text = req.body.msg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("addMsgForm", {
        title: "Create a New Message",
        errors: errors.array(),
      });
    }
    await pool.query(
      "INSERT INTO messages (title, user_id, text) VALUES ($1, $2, $3)",
      [title, userId, text]
    );

    res.redirect("/message-board");
  },
];

async function getMessageUpdate(req, res) {
  const msgId = req.params.id;
  const username = req.user.username;

  try {
    const row = await pool.query(
      `SELECT * FROM messages WHERE messages_id = $1`,
      [msgId]
    );
    const message = row.rows;

    res.render("updateMsg", {
      title: "Update Message",
      message: message,
      username: username,
    });
  } catch (error) {
    console.error("Error getting message:", error);
    throw new Error("Failed to retrieve message");
  }
}

const postMessageUpdate = [
  validateMsg,
  async (req, res) => {
    try {
      const msgId = req.params.id;
      const title = req.body.title;
      const msg = req.body.msg;
      await pool.query(
        "UPDATE messages SET title = $1, text = $2 WHERE messages_id = $3 ",
        [title, msg, msgId]
      );
      res.redirect("/message-board");
    } catch (error) {
      console.error("Error getting message:", error);
      throw new Error("Failed to retrieve message");
    }
  },
];

module.exports = {
  getMessages,
  getCreateMessage,
  postCreateMessage,
  getMessageUpdate,
  postMessageUpdate,
};
