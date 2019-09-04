const extractFileExtension = (file) => {
  const dotIndex = file.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return file.substring(dotIndex, file.length).toLowerCase()
}

export const canUsePDFViewer = (fileName) => {
  if (!fileName) return false
  const extension = extractFileExtension(fileName)
  return ['.png', '.pdf', '.jpg', '.jpeg'].includes(extension)
}
