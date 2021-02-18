import { app, BrowserWindow, ipcMain } from 'electron'
import puppeteer from 'puppeteer-extra'
import pie from 'puppeteer-in-electron'
import axios from 'axios'
import util from 'util'
import csvParse from 'csv-parse'
import generateScrapedDataId from './utils/generateScrapedDataId'
import { v4 as uuidv4 } from "uuid";

const csvParseAsync = util.promisify(csvParse)

let axiosCancelTokenSearch

let libreviewAuthTicket = {
  duration: 0,
  expires: 0,
  token: ''
}

let mainWindow

function saveLibreViewAuthTicket (ticket) {
  libreviewAuthTicket = ticket
  axios.defaults.headers.Authorization = `Bearer ${ticket.token}`
}

async function init (app) {
  await pie.initialize(app)
  browser = await pie.connect(app, puppeteer)
}

async function setMainWindow (window) {
  mainWindow = window
}

async function searchPatientsInLibreView (term) {
  const url = 'https://api-eu.libreview.io/patients/search'

  if (axiosCancelTokenSearch) {
    axiosCancelTokenSearch.cancel()
  }

  try {
    axiosCancelTokenSearch = axios.CancelToken.source()
    const res = await axios.post(
      url,
      {
        limit: 50,
        match: [
          {
            term,
            fields: ['firstName', 'lastName', 'email']
          }
        ]
      },
      { cancelToken: axiosCancelTokenSearch.token }
    )

    saveLibreViewAuthTicket(res.data.ticket)

    const patients = res.data.data.patients.map(
      ({ practices, ...rest }) => rest
    )

    return patients
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Canceled previous search')
    }
  }
}

async function scrapeLibreView (patientId, byUser, userId) {
  const browser = await pie.connect(app, puppeteer)
  const window = new BrowserWindow({
    show: false,
    parent: mainWindow,
    modal: true,
    webPreferences: { devTools: false }
  })
  const page = await pie.getPage(browser, window)

  window.webContents.session.on('will-download', (e, item, webContents) => {
    e.preventDefault()
  })

  console.log('Loading homepage...')

  await page.goto('https://www.libreview.com')

  console.log('Setting session storage...', libreviewAuthTicket)

  await page.evaluate(
    ({ libreviewAuthTicket }) => {
      sessionStorage.setItem('token', JSON.stringify(libreviewAuthTicket))

      sessionStorage.setItem('loggedIn', '{"loggedIn": true}')
    },
    { libreviewAuthTicket }
  )

  console.log('Go to patient profile...')

  await page.goto(`https://www.libreview.com/patient/${patientId}/profile`)
  await page.waitForSelector('#patient-profile-data-download-button')

  console.log('Presenting captcha...')
  await page.click('#patient-profile-data-download-button')

  // Prepare to present the window (captcha) to the user
  await page.addStyleTag({ path: 'styles/misc/captcha.css' })
  await page.evaluate(() => {
    document.addEventListener(
      'click',
      e => {
        if (!e.target.closest('.modal-content')) {
          e.preventDefault()
          e.stopPropagation()
        }
      },
      true
    )
  })
  window.setSize(450, 650)
  window.show()

  await page.waitForSelector(
    '[id=exportData-modal-download-button][aria-disabled=false]',
    { timeout: 0 }
  )
  await page.waitForTimeout(500)
  await page.click('[id=exportData-modal-download-button][aria-disabled=false]')

  window.hide()

  mainWindow.webContents.send('captcha-solved')

  const response = await page.waitForResponse(async r => {
    return (
      r.request().method() === 'GET' &&
      r
        .request()
        .url()
        .includes('libreview.storage')
    )
  })

  console.log('Fetching data...')

  const csvRaw = await response.text()

  const uploadId = uuidv4()
  const units = 'mmol/L'
  const deviceId = 'libreview'
  const now = new Date().toISOString()

  const upload = {
    type: 'upload',
    id: uploadId,
    uploadId,
    deviceId,
    time: now,
    computerTime: now.replace('Z', ''),
    timezone: 'Europe/Copenhagen',
    version: '2.34.1',
    byUser,
    deviceTags: ['cgm'],
    deviceManufacturers: ['Abbott'],
    deviceModel: 'FreeStyle Libre',
    userId,
    deviceSerialNumber: userId,
    timeProcessing: 'none'
  }

  let data = await csvParseAsync(csvRaw, {
    from_line: 3,
    columns: true,
    relax_column_count: true
  })

  if (!data || data.length === 0) {
    return []
  }

  data = data.map(result => {
    let date = result['Device Timestamp']

    if (date) {
      date =
        date
          .split(' ')[0]
          .split('-')
          .reverse()
          .join('-') +
        ' ' +
        date.split(' ')[1]
    }

    const fixedDate = date ? new Date(date) : null
    const recordType = Number(result['Record Type'])

    const value =
      recordType === 0
        ? Number(result['Historic Glucose mmol/L'])
        : Number(result['Scan Glucose mmol/L'])

    return {
      id: generateScrapedDataId(fixedDate, value),
      units,
      value,
      type: 'cbg',
      uploadId,
      deviceId,
      time: fixedDate ? fixedDate.toISOString() : null
    }
  })

  data.unshift(upload)

  return data
}

export default {
  init,
  setMainWindow,
  searchPatientsInLibreView,
  scrapeLibreView,
  saveLibreViewAuthTicket
}
