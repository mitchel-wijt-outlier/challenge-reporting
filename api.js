const _ = require('lodash')
const { Readable } = require('stream')

const knex = require('./db')
const { fetchStudentWithGrades, fetchGradesByCourse, COURSES } = require('./grades')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
  try {
    await knex('students').first()
    res.json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  const { id } = req.params
  const student = await fetchStudentFromId(id)

  return res.json(student)
}

async function getStudentGradesReport (req, res, next) {
  const { id } = req.params
  const result = await fetchStudentWithGrades(id)

  res.json(result)
}

async function getCourseGradesReport (req, res, next) {
  const gradeReport = await getCourseGrades()
  res.json(gradeReport)
}

async function getCourseGrades () {
  const result = []
  const gradesStream = getCourseGradesStream()

  return new Promise((resolve, reject) => {
    gradesStream
      .on('data', (courseGradeData) => result.push(courseGradeData))
      .on('end', () => resolve(result))
      .on('error', (err) => console.log(err))
  })
}

function getCourseGradesStream () {
  const stream = new Readable({ objectMode: true, read () {} });

  (async function () {
    for (const course of COURSES) {
      const grades = fetchGradesByCourse(course)
      const averageGrade = (_.sumBy(grades, 'grade')) / grades.length

      stream.push({
        course: 'Astronomy',
        minGrade: grades[0],
        maxGrade: grades[grades.length - 1],
        averageGrade
      })
    }
    stream.push(null)
  })()

  return stream
}

async function fetchStudentFromId (id) {
  if (!id) throw new Error('student id is required')

  const student = await knex('students').select('*').where({ id })
  if (!student.length) throw new Error(`student with id ${id} not found`)

  return student[0]
}
