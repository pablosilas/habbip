import React from "react"

export function useCloseJoke() {
  const [attempt, setAttempt] = React.useState(0)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [upsideDown, setUpsideDown] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)

  const handleCloseClick = () => {
    setAttempt((v) => v + 1)
    setModalOpen(true)
  }

  const handleConfirmClose = () => {
    setModalOpen(false)
    setUpsideDown(true)
    setTimeout(() => {
      setUpsideDown(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }, 1000)
  }

  return {
    attempt,
    modalOpen,
    setModalOpen,
    upsideDown,
    showToast,
    handleCloseClick,
    handleConfirmClose,
  }
}