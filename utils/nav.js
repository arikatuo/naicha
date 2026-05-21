function encodePayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodePayload(encoded) {
  if (!encoded) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch (error) {
    return null;
  }
}

module.exports = {
  encodePayload,
  decodePayload
};
