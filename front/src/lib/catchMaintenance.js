/**
 * @description The purpose of this function is to check if the error is due to maintenance of our service.
 * If so, refresh the current page so that nginx displays the maintenance page.
 * 
 * @param {Error} error 
 */
export default function catchMaintenance(error) {
  if (error.status === 503 && error.response && error.response.text && error.response.text.includes('maintenance-page')) {
    return window.location.reload();
  }
  throw error;
}
