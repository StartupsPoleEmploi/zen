const extractFileExtension = (file) => {
  const dotIndex = file.lastIndexOf('.')
  if (dotIndex === -1) throw Error(`No extension detected in file ${dotIndex}`)
  return file.substring(dotIndex, file.length).toLowerCase()
}

export const canUsePDFViewer = (fileName) => {
  const extension = extractFileExtension(fileName)
  return ['.png', '.pdf', '.jpg', '.jpeg'].includes(extension)
}
