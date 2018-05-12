import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

/* ----------  ACTION THUNK CREATORS  ---------- */
import {
  thunks as modelsThunks,
  actionCreators as modelsActions
} from '../redux/models'
import { actionCreators as currentModelActions } from '../redux/currentModel'
import { actionCreators as formsActions } from '../redux/forms'
import { actionCreators as uiActions } from '../redux/ui'
import { actionCreators as errorsActions } from '../redux/errors'

/* ----------  APP COMPONENTS  ---------- */
import AppBar from './AppBar'
import { CONFIG_DISPLAY } from './Model/Configuration'

/* ----------  UI LIBRARY COMPONENTS  ---------- */
import { Modal, Button, Input, Container, Card, Divider } from 'semantic-ui-react'

/* ----------  COMPONENT  ---------- */
class Schema extends React.Component {
  constructor (props) {
    super(props)
    this.nameInput = React.createRef()
    this.addModelButton = React.createRef()
  }

  gotoModel = id => this.props.history.push(`/${id}`)
  editModel = id => this.props.history.push(`/${id}/edit`)
  focusOnAction = (id, action) => document.getElementById(`${action}-${id}`).focus()

  focusOnNameInput = () =>
    this.nameInput.current && this.nameInput.current.focus()

  focusOnAddModelButton = () =>
    this.addModelButton.current && this.addModelButton.current.focus()

  componentDidMount () {
    this.focusOnAddModelButton()
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.creatingModel && this.props.creatingModel) {
      this.focusOnNameInput()
    }

    if (prevProps.creatingModel && !this.props.creatingModel) {
      this.focusOnAddModelButton()
    }
  }

  componentWillUnmount () {
    this.props.modelsActions.cancelPreviewModel()
  }

  static ModelCard = ({
  // State
    isCurrent,
    modelNameObj,
    model,
    // Actions
    focusOnAction,
    previewModel,
    gotoModel,
    removeModel
  }) =>
    <Card
      className='model-card'
      tabIndex={0}
      onKeyPress={evt => {
        switch (evt.key) {
          case 'Enter': return focusOnAction(model.id, 'preview')
          default:
        }
      }}
    >
      <Card.Content>
        <div className='model-card-header'>
          <Card.Header as='h3' content={model.name} />
        </div>
        <div className='model-card-btns'>
          <Button
            id={`preview-${model.id}`}
            icon='eye'
            size='tiny'
            circular
            onClick={previewModel}
            tabIndex={-1}
            onKeyDown={evt => {
              switch (evt.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                  return focusOnAction(model.id, 'delete')
                case 'ArrowRight':
                case 'ArrowDown':
                  return focusOnAction(model.id, 'edit')
                default:
              }
            }}
          />
          <Button
            id={`edit-${model.id}`}
            icon='pencil'
            size='tiny'
            circular
            onClick={gotoModel}
            tabIndex={-1}
            onKeyDown={evt => {
              switch (evt.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                  return focusOnAction(model.id, 'preview')
                case 'ArrowRight':
                case 'ArrowDown':
                  return focusOnAction(model.id, 'delete')
                default:
              }
            }}
          />
          <Button
            id={`delete-${model.id}`}
            icon='trash'
            size='tiny'
            circular
            onClick={removeModel}
            tabIndex={-1}
            onKeyDown={evt => {
              switch (evt.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                  return focusOnAction(model.id, 'edit')
                case 'ArrowRight':
                case 'ArrowDown':
                  return focusOnAction(model.id, 'preview')
                default:
              }
            }}
          />
        </div>
      </Card.Content>
    </Card>

  static PreviewModal = ({ model, close, edit }) =>
    <Modal
      closeOnDimmerClick
      open={Boolean(model)}
      onClose={close}
      size='small'
      className='preview-modal'
    >
      {model &&
      <React.Fragment>
        <Modal.Header>
          {model.name}
          <Button className='close-btn' icon='cancel' onClick={close} />
          <Button className='edit-btn' icon='edit' onClick={edit} />
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            {Schema.viewMethods(model.methods)}
            {Schema.viewConfiguration(model.config)}
          </Modal.Description>
        </Modal.Content>
      </React.Fragment>
      }
    </Modal>

    static viewMethods = methods => {
      const methodDisplays =
        Object.keys(methods)
          .filter(key => methods[key])
          .map(key => CONFIG_DISPLAY[key])

      return methodDisplays.length
        ? <p>{`Method Templates: ${methodDisplays.join(', ')}`}</p>
        : null
    }

    static viewConfiguration = config => {
      const configDisplays =
        Object.keys(config)
          .filter(key => config[key])
          .map(key =>
            typeof config[key] === 'boolean'
              ? CONFIG_DISPLAY[key]
              : `${CONFIG_DISPLAY[key]}: ${config[key]}`
          )

      return configDisplays.length
        ? <p>{`Configuration: ${configDisplays.join(', ')}`}</p>
        : null
    }

    render () {
      const {
        history,
        currentId,
        models,
        previewModel,
        newModelName,
        creatingModel,
        // errors,
        modelsActions,
        uiActions,
        modelsThunks: { createModel },
        formsActions: { inputModelsModelName }
      } = this.props

      return (
        <React.Fragment>
          <AppBar
            menuLinks={[
              { active: true, icon: 'cubes', label: 'Models' }
            ]}
          />
          <Container id='content'>
            <Container textAlign='center'>
              {creatingModel
                ? (
                  <Input
                    ref={this.nameInput}
                    placeholder='Name your model...'
                    value={newModelName}
                    onChange={evt => inputModelsModelName(evt.target.value)}
                    onKeyPress={evt => evt.key === 'Enter' && createModel(newModelName)}
                    action
                  >
                    <input />
                    <Button
                      onClick={() => createModel(newModelName)}
                    >
                    Create
                    </Button>
                    <Button
                      onClick={() => uiActions.stopCreatingModel()}
                    >
                    Cancel
                    </Button>
                  </Input>
                )
                : (
                  <Button
                    ref={this.addModelButton}
                    onClick={uiActions.startCreatingModel}
                    className='create-model-btn'
                  >
                Create a Model
                  </Button>
                )
              }
            </Container>
            <Divider />
            <Card.Group centered>
              {models.map(model => (
                <Schema.ModelCard
                  key={model.id}
                  isCurrent={model.id === currentId}
                  model={model}
                  previewModel={() => modelsActions.previewModel(model.id)}
                  gotoModel={() => history.push(`/${model.id}`)}
                  removeModel={() => modelsActions.removeModel(model.id)}
                  focusOnAction={this.focusOnAction}
                />
              ))}
            </Card.Group>
          </Container>
          <Schema.PreviewModal
            model={previewModel}
            close={modelsActions.cancelPreviewModel}
            edit={() => history.push(`/${previewModel.id}`)}
          />
        </React.Fragment>
      )
    }
}
const mapStateToProps = ({ currentModel, models: { models, previewModel }, forms, ui, errors }) => ({
  currentId: currentModel.id,
  models,
  previewModel: previewModel && models.find(({ id }) => previewModel === id),
  newModelName: forms.models.newModelName,
  creatingModel: ui.addModelState.creatingModel,
  errors: errors.models
})

const mapDispatchToProps = dispatch => ({
  currentModelActions: bindActionCreators(currentModelActions, dispatch),
  modelsActions: bindActionCreators(modelsActions, dispatch),
  formsActions: bindActionCreators(formsActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  errorsActions: bindActionCreators(errorsActions, dispatch),
  modelsThunks: bindActionCreators(modelsThunks, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Schema)
