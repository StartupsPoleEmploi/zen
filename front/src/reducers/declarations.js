/* eslint-disable no-param-reassign */
/*
 * Reducers with redux-starter-kit use immer to allow us to describe in an imperative
 * way state changes, which is way faster and easier to write, read and understand than
 * writing usual reducers.
 *
 * Nothing is mutated here, refer to immer library to know how it works
 * (note: this description of immer here is useful because it is not an explicit
 * dependency of this project, as it is bundled in redux-starter-kit)
 */
import { createReducer } from 'redux-starter-kit'

import {
  DECLARATION_INFO_ERROR,
  DECLARATION_INFO_LOADING,
  DECLARATION_SUCCESS,
  EMPLOYER_DOC_ERROR,
  EMPLOYER_DOC_LOADING,
  EMPLOYER_SUCCESS,
  HIDE_EMPLOYER_FILE_PREVIEW,
  HIDE_INFO_FILE_PREVIEW,
  LOAD_DECLARATIONS_ERROR,
  LOAD_DECLARATIONS_SUCCESS,
  SET_LOADING,
  SHOW_EMPLOYER_FILE_PREVIEW,
  SHOW_INFO_FILE_PREVIEW,
  ACTIVE_DECLARATION_LOADING,
  ACTIVE_DECLARATION_SUCCESS,
  ACTIVE_DECLARATION_FAILURE,
} from '../actions/actionNames'
import { utils } from '../selectors/declarations'

const {
  findEmployer,
  findEmployerDoc,
  findDeclarationInfo,
  getEmployerErrorKey,
  getEmployerLoadingKey,
} = utils

const declarationsReducer = createReducer(
  {
    isLoading: false,
    declarations: [],
    employers: [],
    employersDocuments: [],
    declarationsInfos: [],
    previewedEmployerFile: null,
    previewedInfoFile: null,
    activeDeclaration: null,
    isActiveDeclarationLoading: false,
    activeDeclarationError: null,
  },
  {
    [SET_LOADING]: (state) => {
      state.isLoading = true
      state.error = true
    },
    [LOAD_DECLARATIONS_SUCCESS]: (state, action) => {
      state.declarations = action.payload
      state.isLoading = false
    },
    [LOAD_DECLARATIONS_ERROR]: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    [DECLARATION_INFO_LOADING]: ({ declarations }, { payload: { infoId } }) => {
      const info = findDeclarationInfo({ declarations, infoId })
      info.isLoading = true
      info.error = null
    },
    [DECLARATION_INFO_ERROR]: (
      { declarations },
      { payload: { infoId, err } },
    ) => {
      const info = findDeclarationInfo({ declarations, infoId })
      info.error = err
      info.isLoading = false
    },
    [DECLARATION_SUCCESS]: ({ declarations }, { payload }) => {
      const index = declarations.findIndex(
        (declaration) => declaration.id === payload.declaration.id,
      )
      declarations[index] = payload.declaration
    },

    [EMPLOYER_DOC_LOADING]: (
      { declarations },
      { payload: { documentId, employerId, employerDocType } },
    ) => {
      if (documentId) {
        const employerDoc = findEmployerDoc({ declarations, documentId })
        employerDoc.isLoading = true
        employerDoc.error = null
      }
      // these keys are fallbacks if we don't have document ids
      // (for employers, we do not have ids before user uploads)
      const employer = findEmployer({ declarations, employerId })
      employer[getEmployerLoadingKey(employerDocType)] = true
      employer[getEmployerErrorKey(employerDocType)] = null
    },
    [EMPLOYER_DOC_ERROR]: (
      { declarations },
      { payload: { documentId, employerId, employerDocType, err } },
    ) => {
      if (documentId) {
        const employerDoc = findEmployerDoc({ declarations, documentId })
        employerDoc.isLoading = false
        employerDoc.error = err
      }
      // these keys are fallbacks if we don't have document ids
      // (for employers, we do not have ids before user uploads)
      const employer = findEmployer({ declarations, employerId })
      employer[getEmployerLoadingKey(employerDocType)] = false
      employer[getEmployerErrorKey(employerDocType)] = err
    },
    [EMPLOYER_SUCCESS]: ({ declarations }, { payload }) => {
      for (const declaration of declarations) {
        const index = declaration.employers.findIndex(
          (employer) => employer.id === payload.id,
        )
        if (index !== -1) {
          declaration.employers[index] = payload
          return
        }
      }
    },
    [HIDE_EMPLOYER_FILE_PREVIEW]: (state) => {
      state.previewedEmployerFileId = null
    },
    [SHOW_EMPLOYER_FILE_PREVIEW]: (state, { payload }) => {
      state.previewedEmployerFileId = payload
    },
    [HIDE_INFO_FILE_PREVIEW]: (state) => {
      state.previewedInfoFileId = null
    },
    [SHOW_INFO_FILE_PREVIEW]: (state, { payload }) => {
      state.previewedInfoFileId = payload
    },

    [ACTIVE_DECLARATION_LOADING]: (state) => {
      state.isActiveDeclarationLoading = true
      state.activeDeclaration = null
    },
    [ACTIVE_DECLARATION_SUCCESS]: (state, { payload }) => {
      state.isActiveDeclarationLoading = false
      state.activeDeclaration = payload
    },
    [ACTIVE_DECLARATION_FAILURE]: (state, { payload }) => {
      state.isActiveDeclarationLoading = false
      state.activeDeclarationError = payload
    },
  },
)

export default declarationsReducer
