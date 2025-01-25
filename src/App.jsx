import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // FAQs array for matching user queries
  const faqs = [
    {
      question: "How can I book a gig?",
      answer:
        "Browse services by category, select the desired gig, and place an order. You can chat with the worker directly for any queries.",
    },
    {
      question: "Can I offer my services as a worker?",
      answer:
        "Yes! Clients have the option to get listed as workers and create their own gigs.",
    },
    {
      question: "What is Web3, and how does it work in SevaSquad?",
      answer:
        "Web3 enables decentralized payments through blockchain technology, ensuring secure and transparent transactions between clients and workers.",
    },
    {
      question: "Are payments secure?",
      answer:
        "Absolutely. Web3 transactions are decentralized, making them safe, traceable, and trustworthy.",
    },
    {
      question: "What services are available?",
      answer:
        "You can find services in categories like Cleaning, Childcare, Pet Care, Plumbing, Electrical, Gardening, Painting, Carpentry, and Emergency.",
    },
    {
      question: "How can I communicate with a worker?",
      answer:
        "You can use the in-app messaging system to discuss details with workers after booking their gig.",
    },
    {
      question: "How can workers add their gigs?",
      answer:
        "Workers can log in, navigate to the 'Add Gig' page, fill in the required details, and publish their services.",
    },
    {
      question: "Is there a way to track my orders?",
      answer:
        "Yes, both workers and clients have access to a dedicated 'Orders' page to track the status of bookings.",
    },
    {
      question: "Can workers and clients message each other directly?",
      answer:
        "Yes, SevaSquad includes a real-time messaging system for seamless communication between workers and clients.",
    },
    {
      question: "What happens if I need to cancel a gig?",
      answer:
        "Clients can cancel gigs before the service begins. Refund policies will apply based on the platform's terms and conditions.",
    },
    {
      question: "Are there options for emergency services?",
      answer:
        "Yes, the Emergency category allows users to quickly find workers for urgent needs like plumbing or electrical repairs.",
    },
    {
      question: "Is the platform beginner-friendly for non-tech users?",
      answer:
        "Definitely! SevaSquad is designed to be intuitive and easy to use for everyone, regardless of technical expertise.",
    },
    {
      question: "Can I leave reviews for the workers?",
      answer:
        "Yes, clients can leave reviews and ratings for workers after completing a gig to help others make informed decisions.",
    },
  ];

  function normalizeString(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  }

  async function generateAnswer() {
    setAnswer("Loading...");

    // Check if the user's question matches an FAQ
    const normalizedQuestion = normalizeString(question);

    const matchedFaq = faqs.find((faq) => {
      const normalizedFaqQuestion = normalizeString(faq.question);
      const normalizedUserQuestion = normalizeString(question);

      return (
        normalizedFaqQuestion === normalizedUserQuestion ||
        normalizedUserQuestion.includes(normalizedFaqQuestion)
      );
    });

    if (matchedFaq) {
      setAnswer(matchedFaq.answer);
      return;
    }

    // If no FAQ matches, call Gemini API for a response
    const apiKey = import.meta.env.VITE_API_KEY;

    const projectContext = `
      Project Name: SevaSquad
      Description: SevaSquad is a service-based platform designed to connect users with local gig workers for essential services. The platform promotes trust, efficiency, and convenience through a simple, user-friendly design and secure Web3 transactions.

      FAQs:
      ${faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n")}
    `;

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      setAnswer(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"] ||
          "No answer found"
      );
    } catch (error) {
      setAnswer("Error fetching response. Please try again later.");
      console.error(error);
    }
  }

  return (
    <>
      <h1>Ask AI for Help</h1>
      <div className="question-container">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question here..."
          cols="60"
          rows="5"
        ></textarea>
        <button onClick={generateAnswer}>Generate Answer</button>
      </div>
      <div className="answer">
        <p>{answer}</p>
      </div>
    </>
  );
}

export default App;

async function generateAnswer() {
  setAnswer("Loading...");

  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    setAnswer("API Key is missing. Please check your environment setup.");
    console.error("API Key is missing.");
    return;
  }

  const projectContext = `
      Project Name: SevaSquad
      Description: SevaSquad connects users with local gig workers for essential services. FAQs:
      ${faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n")}
    `;

  try {
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        messages: [
          {
            role: "user",
            content: `Context: ${projectContext}\nUser Question: ${question}`,
          },
        ],
        candidateCount: 1,
      },
    });

    console.log("API Response:", response.data);

    // Extract the answer from the response structure
    const answer =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer found.";
    setAnswer(answer);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    setAnswer("Error fetching response. Please try again later.");
  }
}
