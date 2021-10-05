const _ = require('lodash')
const knex = require('./db')
const grades = require('./grades.json')

const COURSES = [
  'Astronomy',
  'Calculus',
  'Statistics',
  'Microeconomics',
  'Philosophy'
]

module.exports = {
  fetchGradesByCourse,
  fetchStudentWithGrades,
  COURSES
}

function fetchGradesByIndex (index) {
  const result = recursivelyGetGrades(index, index, [])
  return result
}

function recursivelyGetGrades (idSearchCase, index, data) {
  const gradeAtIndex = grades[index]
  if (!gradeAtIndex || gradeAtIndex.id > idSearchCase) return data

  if (gradeAtIndex.id <= idSearchCase) {
    if (gradeAtIndex.id === Number(idSearchCase)) data.push(gradeAtIndex)
    return recursivelyGetGrades(idSearchCase, ++index, data)
  }
}

function fetchGradesByCourse (course) {
  const newGrades = _.sortBy(grades, ['course', 'grade'])
  const filteredGrades = _.filter(newGrades, { course })
  return filteredGrades
}

async function fetchStudentWithGrades (id) {
  const [student] = await knex('students').select('*').where({ id })
  const studentGrades = fetchGradesByIndex(id)

  return {
    student,
    grades: studentGrades
  }
}
