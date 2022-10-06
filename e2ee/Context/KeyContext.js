import { createContext, useRef } from "react"
import primeNumbers from "../utils/primes.json"

export const KeyContext = createContext()

const KeyProvider = ({ children }) => {
  const publicKey = useRef(primeNumbers[9])
  const generatorKey = useRef(primeNumbers[10])
  return (
    <KeyContext.Provider value={{ publicKey, generatorKey }}>
      {children}
    </KeyContext.Provider>
  )
}

export default KeyProvider
