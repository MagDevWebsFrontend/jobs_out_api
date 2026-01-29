// src/utils/file.utils.js
const fs = require('fs')
const path = require('path')

function removeFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
  } catch (err) {
    console.error('removeFileIfExists error:', err)
  }
  return false
}

function removeDirIfEmpty(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      if (files.length === 0) fs.rmdirSync(dirPath)
      return true
    }
  } catch (err) {
    console.error('removeDirIfEmpty error:', err)
  }
  return false
}

module.exports = { removeFileIfExists, removeDirIfEmpty }
