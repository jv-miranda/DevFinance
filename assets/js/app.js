function toggleModalOpen(modalId) {
  const modalOverlay = document.querySelector(`#${modalId}`)
  modalOverlay.classList.toggle(`open`)
}