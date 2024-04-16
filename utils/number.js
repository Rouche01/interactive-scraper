const convertStringToNumber = (string) => {
  if (!string) {
    return 0;
  }
  const parsedString = parseInt(string);
  return isNaN(parsedString) ? 0 : parsedString;
};

const stripNonNumericFromString = (string) => {
  return string.replace(/\D/g, "");
};

const convertPercentToFraction = (percentage) => {
  if (!percentage) {
    return 0;
  }

  return percentage / 100;
};

module.exports = {
  convertStringToNumber(string) {
    return convertStringToNumber(string);
  },
  stripNonNumericFromString(string) {
    return stripNonNumericFromString(string);
  },
  convertPercentToFraction(percent) {
    return convertPercentToFraction(percent);
  },
};
