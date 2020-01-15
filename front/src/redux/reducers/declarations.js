/* eslint-disable no-param-reassign */
/*
 * Reducers with @reduxjs/toolkit use immer to allow us to describe in an imperative
 * way state changes, which is way faster and easier to write, read and understand than
 * writing usual reducers.
 *
 * Nothing is mutated here, refer to immer library to know how it works
 * (note: this description of immer here is useful because it is not an explicit
 * dependency of this project, as it is bundled in @reduxjs/toolkit)
 */
import { createReducer } from '@reduxjs/toolkit'

import {
  POST_DECLARATION_INFO_FAILURE,
  POST_DECLARATION_INFO_LOADING,
  FETCH_DECLARATION_SUCCESS,
  POST_EMPLOYER_DOC_FAILURE,
  POST_EMPLOYER_DOC_LOADING,
  FETCH_EMPLOYER_SUCCESS,
  HIDE_EMPLOYER_FILE_PREVIEW,
  HIDE_INFO_FILE_PREVIEW,
  FETCH_DECLARATIONS_FAILURE,
  FETCH_DECLARATIONS_SUCCESS,
  FETCH_DECLARATIONS_LOADING,
  SHOW_EMPLOYER_FILE_PREVIEW,
  SHOW_INFO_FILE_PREVIEW,
  FETCH_ACTIVE_DECLARATION_LOADING,
  FETCH_ACTIVE_DECLARATION_SUCCESS,
  FETCH_ACTIVE_DECLARATION_FAILURE,
  SHOW_DECLARATION_TRANSMITTED_DIALOG,
  HIDE_DECLARATION_TRANSMITTED_DIALOG,
} from '../actions/actionNames'
import { utils } from '../../selectors/declarations'

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
    showDeclarationTransmittedDialog: false,
  },
  {
    [FETCH_DECLARATIONS_LOADING]: (state) => {
      state.isLoading = true
      state.error = true
    },
    [FETCH_DECLARATIONS_SUCCESS]: (state, action) => {
      state.declarations = action.payload
      state.isLoading = false
    },
    [FETCH_DECLARATIONS_FAILURE]: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    [POST_DECLARATION_INFO_LOADING]: (
      { declarations },
      { payload: { documentId } },
    ) => {
      const info = findDeclarationInfo({ declarations, documentId })
      info.isLoading = true
      info.error = null
    },
    [POST_DECLARATION_INFO_FAILURE]: (
      { declarations },
      { payload: { documentId, err } },
    ) => {
      const info = findDeclarationInfo({ declarations, documentId })
      info.error = err
      info.isLoading = false
    },
    [FETCH_DECLARATION_SUCCESS]: (
      { declarations },
      { payload: declaration },
    ) => {
      const index = declarations.findIndex((d) => d.id === declaration.id)
      declarations[index] = declaration
    },

    [POST_EMPLOYER_DOC_LOADING]: (
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
    [POST_EMPLOYER_DOC_FAILURE]: (
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
    [FETCH_EMPLOYER_SUCCESS]: ({ declarations }, { payload }) => {
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

    [FETCH_ACTIVE_DECLARATION_LOADING]: (state) => {
      state.isActiveDeclarationLoading = true
      state.activeDeclaration = null
    },
    [FETCH_ACTIVE_DECLARATION_SUCCESS]: (state, { payload }) => {
      state.isActiveDeclarationLoading = false
      state.activeDeclaration = payload
    },
    [FETCH_ACTIVE_DECLARATION_FAILURE]: (state, { payload }) => {
      state.isActiveDeclarationLoading = false
      state.activeDeclarationError = payload
    },
    [SHOW_DECLARATION_TRANSMITTED_DIALOG]: (state) => {
      state.showDeclarationTransmittedDialog = true
    },
    [HIDE_DECLARATION_TRANSMITTED_DIALOG]: (state) => {
      state.showDeclarationTransmittedDialog = false
    },
  },
)

export default declarationsReducer
