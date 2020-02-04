import { get } from 'lodash'
import { readAndCompressImage } from 'browser-image-resizer'

const salarySheetType = 'salarySheet'
const employerCertificateType = 'employerCertificate'

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

export const getMissingEmployerFiles = (declaration) =>
  declaration.employers.reduce((prev, employer) => {
    if (!employer.hasEndedThisMonth) {
      if (!get(employer, 'documents[0].isTransmitted')) {
        return prev.concat({
          name: employer.employerName,
          type: salarySheetType,
        })
      }
      return prev
    }

    /*
        The salary sheet is optional for users which have already sent their employer certificate,
        in which case we do not count it in the needed documents.
      */
    const hasEmployerCertificate = employer.documents.some(
      ({ type, isTransmitted }) =>
        type === employerCertificateType && isTransmitted,
    )
    const hasSalarySheet = employer.documents.some(
      ({ type, isTransmitted }) => type === salarySheetType && isTransmitted,
    )

    if (hasEmployerCertificate) return prev

    if (hasSalarySheet) {
      return prev.concat({
        name: employer.employerName,
        type: employerCertificateType,
      })
    }
    return prev.concat(
      { name: employer.employerName, type: salarySheetType },
      { name: employer.employerName, type: employerCertificateType },
    )
  }, [])

export const getDeclarationMissingFilesNb = (declaration) => {
  const infoDocumentsRequiredNb = declaration.infos.filter(
    ({ type, isTransmitted }) => type !== 'jobSearch' && !isTransmitted,
  ).length

  return (
    declaration.employers.reduce((prev, employer) => {
      if (!employer.hasEndedThisMonth) {
        return prev + (get(employer, 'documents[0].isTransmitted') ? 0 : 1)
      }

      /*
          The salary sheet is optional for users which have already sent their employer certificate,
          in which case we do not count it in the needed documents.
        */
      const hasEmployerCertificate = employer.documents.some(
        ({ type, isTransmitted }) =>
          type === employerCertificateType && isTransmitted,
      )
      const hasSalarySheet = employer.documents.some(
        ({ type, isTransmitted }) => type === salarySheetType && isTransmitted,
      )

      if (hasEmployerCertificate) return prev + 0
      return prev + (hasSalarySheet ? 1 : 2)
    }, 0) + infoDocumentsRequiredNb
  )
}

export function isImage(file) {
  if (!file.type) return false
  return file.type.startsWith('image/')
}

export async function optimizeImage(file) {
  try {
    const blob = await readAndCompressImage(file, {
      quality: 0.8,
      maxWidth: 1500,
      maxHeight: 1500,
      mimeType: 'image/jpeg',
    })
    return new File([blob], file.name, { type: 'image/jpeg' })
  } catch (err) {
    // Optimization failed...
    // We will continue with the unoptimized file
    return file
  }
}
