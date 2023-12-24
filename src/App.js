import "./App.css";
import axios from 'axios';
import jsonData from './substrings.json';
import { useState, useEffect, useRef } from "react";

function App() {
  const [score, setScore] = useState(0);
  // -1 is no game running, 0 is game lose, anything greater is difficulty of game
  const [difficulty, setDifficulty] = useState(-1);
  const [lastScore, setLastScore] = useState('');
  const [substring, setSubstring] = useState('');
  const [lives, setLives] = useState(2);
  const usedWords = useRef(new Set());
  const letters = useRef(Array.from({length: 26}, () => false));
  const substringRef = useRef('');
  const setSubstringRef = (data) => {
    substringRef.current = data;
    setSubstring(data);
  }
  const livesRef = useRef(2);
  const setLivesRef = (data) => {
    livesRef.current = data;
    setLives(data);
  }

  return(
    <>
      <div className="header">
        <HeaderContent score={score} lives={lives}/>
      </div>
      <div className="main">
        <Game setScore={setScore} difficulty={difficulty} setDifficulty={setDifficulty} lastScore={lastScore} setLastScore={setLastScore} score={score} usedWords={usedWords} substring={substring} setSubstring={setSubstringRef} lives={lives} setLives={setLivesRef} letters={letters} substringRef={substringRef} livesRef={livesRef} setLivesRef={setLivesRef}/>
      </div>
      <div className="footer">
        <FooterContent setDifficulty={setDifficulty}/>
      </div>
    </>
  );
}

function Game({setScore, difficulty, setDifficulty, lastScore, setLastScore, score, usedWords, substring, setSubstring, lives, setLives, letters, substringRef, livesRef, setLivesRef}) {
  return (
    <>
      <div className="play">
        <Bomb difficulty={difficulty} setDifficulty={setDifficulty} setScore={setScore} lastScore={lastScore} setLastScore={setLastScore} score={score} usedWords={usedWords} lives={lives} setLives={setLives} letters={letters}/>
        <Substring text={substring} setText={setSubstring} score={score} difficulty={difficulty} lives={lives}/>
        <TextBox setScore={setScore} difficulty={difficulty} usedWords={usedWords} substring={substringRef} letters={letters} lives={livesRef} setLives={setLivesRef}/>
      </div>
      <div className="letters">
        <Letters letters={letters}/>
      </div>
    </>
  )
}

function Bomb({difficulty, setDifficulty, setScore, lastScore, setLastScore, score, usedWords, lives, setLives, letters}) {
  const [timeLeft, setTimeLeft] = useState(-1);
  const [timerRotation, setTimerRotation] = useState(0);

  useEffect(() => {
    if (difficulty > 0) {
      setLastScore('');
      setTimeLeft(difficulty);
    }
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft != -1) {
      const intervalId = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prevTime) => prevTime - 0.1);
          let percentLeft = (timeLeft / difficulty) * 100;
          setTimerRotation(360 - (percentLeft / 100) * 360);
        } else {
          if (lives > 1) {
            setLives((prevLives) => prevLives - 1);
            setTimeLeft(difficulty);
          } else {
            setLives(0);
            clearInterval(intervalId);
            setLastScore(score);
            setDifficulty(0);
            setTimerRotation(360);
            setScore(0);
            setTimeout(() => {
              setTimerRotation(0);
              setDifficulty(-1);
              usedWords.current.clear();
              setLives(2);
              letters.current = letters.current.map(() => false);
            }, 500)
          }
        }
      }, 100);
  
      return () => clearInterval(intervalId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (score > 0) {
      setTimeLeft(difficulty);
    }
  }, [score]);

  return(
    <div id="bomb" style={{backgroundImage: `conic-gradient(#ff0000 ${timerRotation}deg, transparent ${timerRotation}deg 360deg)`}}>
      {lastScore}
    </div>
  );
}

function Substring({text, setText, score, difficulty, lives}) {
  // when the game starts, it sets a random substring
  // upon a change in score to != 0, sets a new substring
  // when score changes to 0, sets the substring to empty

  useEffect(() => {
    if (score > 0) {
      const keys = Object.keys(jsonData);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomSubstrings = jsonData[randomKey];
      const substring = randomSubstrings[Math.floor(Math.random() * randomSubstrings.length)];
      setText(substring);
    }
  }, [score]);

  useEffect(() => {
    if (difficulty == -1) {
      setText('');
    } else if (difficulty > 0) {
      const keys = Object.keys(jsonData);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomSubstrings = jsonData[randomKey];
      const substring = randomSubstrings[Math.floor(Math.random() * randomSubstrings.length)];
      setText(substring);
    }
  }, [difficulty, lives])
  return(
    <div id="substring">
      {text}
    </div>
  )
}

function TextBox({setScore, difficulty, usedWords, substring, letters, lives, setLives}) {
  const [text, setText] = useState("");

  const textRef = useRef("");
  const setTextRef = (data) => {
    textRef.current = data;
    setText(data);
  }

  const handleKeyDown = (event) => {
    if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
      // Add the alphabetical key to the text
      setTextRef(textRef.current + event.key.toLowerCase());
    } else if (event.key === 'Backspace') {
      // Delete the last character when Backspace is pressed
      setTextRef(textRef.current.slice(0, -1));
    } else if (event.key === "Enter") {
      // if word has the current substring, if word is a word, and if it has not been said yet
      if (textRef.current.includes(substring.current) && !usedWords.current.has(textRef.current)) {
        axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${textRef.current}`)
          .then(response => {
            usedWords.current.add(textRef.current);
            for (const char of textRef.current) {
              letters.current[char.charCodeAt(0) - 97] = true;
            }
            if (letters.current.every((letter) => letter === true)) {
              setLives(lives.current + 1);
              letters.current = letters.current.map(() => false);
            }
            setTextRef("");
            setScore((prevScore) => prevScore + 1);
          })
          .catch(error => {
            console.error("Not a word");
          });
      }
    }
  } 

  useEffect(() => {
    if (difficulty > 0) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      setTextRef('');
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [difficulty]);
  return (
    <div className="textbox">{text}</div>
  );
}

function Letters({letters}) {
  const lowercaseLetters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));

  return (
    <>
      {lowercaseLetters.map((letter, index) => (
        <div className={`used-${letters.current[index]}`} key={index}>{letter}</div>
      ))}
    </>
  );
}

function HeaderContent({score, lives}) {
  return (
    <Stats score={score} lives={lives}/>
  );
}

function Stats({score, lives}) {
  const hearts = Array.from({length: lives}, (_, index) => index);
  return(
    <>
      <div className="stats">
        <div id="score">
          Score: {score}
        </div>
        <div id="lives">
          Lives: {hearts.map((h, index) => <span>❤️</span>)}
        </div>
      </div>
    </>
  );
}

function FooterContent({setDifficulty}) {
  return (
    <>
      <div className="difficulty" onClick={() => setDifficulty(12)}>Easy</div>
      <div className="difficulty" onClick={() => setDifficulty(8)}>Medium</div>
      <div className="difficulty" onClick={() => setDifficulty(5)}>Hard</div>
    </>
  );
}

export default App;