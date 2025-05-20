import React, {useEffect, useState} from "react";
import "./app.css"
import showdown from "showdown";
import bitcoin from "./images/bitcoin.png"

function App() {
    const [prompt, setPrompt] = useState('')
    const [output, setOutput] = useState('')
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)

    // converter for showdown html
    const converter = new showdown.Converter();

    // Load local stored history and add to history
    useEffect(() => {
        const localStoredHistory = JSON.parse(localStorage.getItem("history") || "[]")
        setHistory(localStoredHistory)
        console.log("Loaded history from localStorage: ", localStoredHistory)
    }, []);


    const askQuestion = async (e) => {
        e.preventDefault()

        setLoading(true)

        console.log(history)

        const options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(
                {
                    history: history,
                    prompt: prompt
                })
        }

        const response = await fetch("https://bitbot-server.vercel.app/", options)

        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8')
            let finalResult = ""

            while (true) {
                const {value, done} = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, {stream: true})
                console.log(chunk)

                finalResult += chunk
                setOutput(finalResult)
            }

            // new history takes previous history and adds current prompt and AI message
            const newHistory = [...history, {human: prompt, ai: finalResult}]

            // Add new history to local storage
            localStorage.setItem("history", JSON.stringify(newHistory))
            // Update history
            setHistory(newHistory)

            setPrompt("");
            setLoading(false)

        } else {
            console.error(`Error while fetching data from ${response.url}`)
            console.error(`HTTP Status: ${response.status} ${response.statusText}`)
            setLoading(false)
        }
    }

    return (
        <div className={"main"}>
            <div className="chat-container">
                <div className="header">
                    <img src={bitcoin} alt={"bitcoin"}/>
                    <h1>BitBot</h1>
                </div>
                <div className={"output-container"}>
                    <div id={"output"}>
                        <p dangerouslySetInnerHTML={{__html: converter.makeHtml(output)}}>
                        </p>
                    </div>
                </div>

                <form onSubmit={askQuestion}>
                    <input id={"input"}
                           type={"text"}
                           value={prompt}
                           onChange={e => setPrompt(e.target.value)}
                           placeholder={"Ask anything..."}
                    />
                    <button id={"btn"} type={"submit"} disabled={loading}>
                        {loading ? "Processing..." : "Ask"}
                    </button>
                </form>
            </div>
            <div className="footer">
                <p>© {new Date().getFullYear()} BitBot. All rights reserved.</p>
            </div>
        </div>
    );
}

export default App