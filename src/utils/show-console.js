
/** Show in console */
export const showHowUsed = (from, data) => {
  const { id: userId, first_name, username } = from;

  console.log(first_name, username, userId);
  console.log(`Type: ${data.mime_type}. Duration:`, data.duration, `sec. File size:`, data.file_size, `bytes.`);
  console.log();
};


/** Show text in console, if user is not slava88008 */
export const showText = (userId, text) => {

  // if (userId === '548083680') return; // slava88008

  console.log('text: ', text);
  console.log();
};
