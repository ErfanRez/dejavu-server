function capitalize(str) {
  if (str.includes(" ")) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = capitalize;
