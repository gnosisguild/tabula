import useLocalStorage from "./useLocalStorage"
import { Pinning } from "../models/pinning"
import { useNavigate } from "react-router-dom"

function usePinning() {
  const navigate = useNavigate()
  const [pinning] = useLocalStorage<Pinning | undefined>("pinning", undefined)
  const [pinningRisk] = useLocalStorage<boolean | undefined>("pinningRisk", undefined)

  const checkPinningSetup = () => {
    if (!pinning && !pinningRisk) {
      navigate(`/pinning`)
      return false
    }
    return true
  }

  return { checkPinningSetup }
}

export default usePinning
