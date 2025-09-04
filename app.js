const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const languageSelect = document.getElementById('languageSelect');

let selectedLang = 'en-US';

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 1;
    utterance.lang = selectedLang;
    window.speechSynthesis.speak(utterance);
}

function wishMe() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) speak("Good Morning Boss...");
    else if (hour >= 12 && hour < 17) speak("Good Afternoon Master...");
    else speak("Good Evening Sir...");
}

window.addEventListener('load', () => {
    speak("Initializing JARVIS..");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = selectedLang;

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
}

btn.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    content.textContent = "🎙 Listening....";
    recognition.start();
});

languageSelect.addEventListener('change', (e) => {
    selectedLang = e.target.value;
    recognition.lang = selectedLang;
});

function takeCommand(message) {
    if (message.startsWith("open ")) {
        let site = message.replace("open ", "").trim().toLowerCase().replace(/\s+/g, "");
        const url = `https://${site}com`;
        window.open(url, "_blank");
        speak(`Opening ${site}`);
    } else if (message.includes("hello") || message.includes("hi")) {
        speak("Hello! How can I help you?");
    } else if (message.includes("how are you")) {
        speak("I am always at your service.");
    } else if (message.includes("who are you")) {
        speak("I am JARVIS, your personal virtual assistant.");
    } else {
        // Gemini ya backend se fetch
        fetch('http://localhost:5000/ask-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, lang: selectedLang })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Reply from server:", data.reply); 
            content.innerText = data.reply;
            speak(data.reply);
        })
        .catch(err => {
            console.error(" Error:", err);
            speak("Sorry, I couldn't understand that.");
        });
    }
}
