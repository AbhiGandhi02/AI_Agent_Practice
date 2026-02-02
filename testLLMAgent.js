require("dotenv").config();
const { runAgent } = require("./src/agent/agent");

(async () => {
    const question =
        "Which subscription plan generates the highest revenue and why?";

    const response = await runAgent(question);
    console.log(JSON.stringify(response, null, 2));
})();
