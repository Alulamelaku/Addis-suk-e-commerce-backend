const logActivity = require("../activityLogger");

function activity(action = "") {
    console.log("in activity.js file");


    logActivity({
      user_id: action.user_id,
      action: action.action,
      description: action.description,
      ip: action.ip,
      agent: action.agent
    });
    console.log("in activity.js file second log");
    return async (req, res, next) => {
    const user = req.user ? req.user.id : null;

    next();
  };
}

module.exports = activity;