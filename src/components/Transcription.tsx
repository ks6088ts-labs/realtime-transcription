import { useEffect, useState, useRef, useCallback } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Stack from 'react-bootstrap/Stack'
import { AudioConfig, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const API_KEY: string | undefined = import.meta.env.VITE_COG_SERVICE_KEY
const API_LOCATION: string | undefined = import.meta.env.VITE_COG_SERVICE_LOCATION
const DEFAULT_LANGUAGE: string = import.meta.env.VITE_DEFAULT_LANGUAGE || 'ja-JP'

// Supported languages for transcription
const SUPPORTED_LANGUAGES = [
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'de-DE', name: 'Deutsch (German)' },
  { code: 'fr-FR', name: 'Français (French)' }
]

// recognizer must be a global variable
let recognizer: SpeechRecognizer

function Transcription() {

  const [recognisedText, setRecognisedText] = useState("")
  const [recognisingText, setRecognisingText] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE)

  const [isRecognising, setIsRecognising] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  // Create speech configuration with current language
  const createSpeechConfig = (language: string) => {
    const speechConfig = SpeechConfig.fromSubscription(API_KEY!, API_LOCATION!)
    speechConfig.speechRecognitionLanguage = language
    return speechConfig
  }

  // this function will create a speech recognizer based on the audio Stream
  // NB -> it will create it, but not start it
  const createRecognizer = useCallback((audioStream: MediaStream, language: string = selectedLanguage) => {

    // Create speech config with the specified language
    const speechConfig = createSpeechConfig(language)
    
    // configure Azure STT to listen to an audio Stream
    const audioConfig = AudioConfig.fromStreamInput(audioStream)

    // recognizer is a global variable
    recognizer = new SpeechRecognizer(speechConfig, audioConfig)

    recognizer.recognizing = (_s, e) => {

      // uncomment to debug
      // console.log(`RECOGNIZING: Text=${e.result.text}`)
      setRecognisingText(e.result.text)
      if (textRef.current) {
        textRef.current.scrollTop = textRef.current.scrollHeight
      }
    }

    recognizer.recognized = (_s, e) => {
      setRecognisingText("")
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {

        // uncomment to debug
        console.log(`RECOGNIZED: Text=${e.result.text}`)

        setRecognisedText((recognisedText) => {
          if (recognisedText === '') {
            return `${e.result.text} `
          }
          else {
            return `${recognisedText}${e.result.text} `
          }
        })
        if (textRef.current) {
          textRef.current.scrollTop = textRef.current.scrollHeight
        }
      }
      else if (e.result.reason === sdk.ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.")
      }
    }

    recognizer.canceled = (_s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`)

      if (e.reason === sdk.CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`)
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`)
        console.log("CANCELED: Did you set the speech resource key and region values?")
      }
      recognizer.stopContinuousRecognitionAsync()
    }

    recognizer.sessionStopped = () => {
      console.log("\n    Session stopped event.")
      recognizer.stopContinuousRecognitionAsync()
    }
  }, [selectedLanguage])

  // this function will start a previously created speech recognizer
  const startRecognizer = () => {
    recognizer.startContinuousRecognitionAsync()
    setIsRecognising(true)
  }

  // this function will stop a running speech recognizer
  const stopRecognizer = () => {
    setIsRecognising(false)
    recognizer.stopContinuousRecognitionAsync()
  }

  const toggleListener = () => {
    if (!isRecognising) {
      startRecognizer()
      setRecognisedText("")
    } else {
      stopRecognizer()
    }
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const wasRecognising = isRecognising
    
    // Stop current recognition if active
    if (isRecognising) {
      stopRecognizer()
    }
    
    // Update language
    setSelectedLanguage(newLanguage)
    
    // Recreate recognizer with new language if we have audio stream
    if (audioStream) {
      createRecognizer(audioStream, newLanguage)
      
      // Restart recognition if it was active
      if (wasRecognising) {
        setTimeout(() => startRecognizer(), 100) // Small delay to ensure recognizer is ready
      }
    }
  }

  useEffect(() => {
    const constraints: MediaStreamConstraints = {
      video: false,
      audio: {
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 16000 }
      }
    }
    const getMedia = async (constraints: MediaStreamConstraints) => {
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        setAudioStream(stream)
        createRecognizer(stream, selectedLanguage)
      } catch (err) {
        /* handle the error */
        alert(err)
        console.log(err)
      }
    }

    getMedia(constraints)

    return () => {
      console.log('unmounting...')
      if (recognizer) {
        stopRecognizer()
      }
    }

  }, [selectedLanguage, createRecognizer])

  const export2txt = (text: string) => {

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = "transcription.txt"
    link.href = url
    link.click()
  }

  return (

    <header className="App-header">
      <Container className="mt-5">
        <Row>
          <Col md={6}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Language / 言語</Form.Label>
                <Form.Select 
                  value={selectedLanguage} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isRecognising}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="my-5">
                <Form.Control 
                  as="textarea"
                  placeholder="The transcription will go here"
                  value={`${recognisedText}${recognisingText}`}
                  readOnly
                  style={{ height: '300px', width: '100%', resize: 'none' }}
                  ref={textRef}
                />
              </Form.Group>
              <Stack direction='horizontal' gap={2}>
                <Button variant={isRecognising ? "secondary" : "primary"} onClick={() => toggleListener()}>
                  {isRecognising ? 'Stop' : 'Start'}
                </Button>
                {(recognisedText !== "") && !isRecognising &&
                  <Button variant="secondary" onClick={() => export2txt(recognisedText)}>
                    Export
                  </Button>
                }
              </Stack>
            </Form>
          </Col>
        </Row>
      </Container>
    </header>
  )
}

export default Transcription
