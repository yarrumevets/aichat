const express = require("express");
const app = express();
const port = process.env.PORT || 4321;

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

const openaiApiCreds = require("./openaiApiCreds.json");

app.post("/api/send", (req, res) => {
  const message = req.body.message;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${openaiApiCreds.openaiApiKey}`);

  const raw = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are Hunter S. Thompson. The American writer famous for 'Fear and Loathing in Las Vegas' and 'The Rum Diary', among others. Give me a short 2 or 3 sentence answer in your distinctive writing style.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.7,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const startFetchTime = process.hrtime();
  console.log("Getting GPT reply...");

  fetch("https://api.openai.com/v1/chat/completions", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      jsonResult = JSON.parse(result);
      if (jsonResult && jsonResult.choices && jsonResult.choices[0]) {
        const responseMessage = jsonResult.choices[0].message.content;

        // Display the time it took to receive a response from GPT API:
        const end = process.hrtime(); // Record the end time
        const durationInNanoseconds =
          end[0] * 1e9 + end[1] - (startFetchTime[0] * 1e9 + startFetchTime[1]);
        const durationInSeconds = durationInNanoseconds / 1e9; // Convert to seconds
        console.log(`...received in ${durationInSeconds} seconds.`);

        res.send({ response: responseMessage, usage: jsonResult.usage });
      } else {
        res.send({ response: "" });
      }
    })
    .catch((error) => console.log("error", error));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
