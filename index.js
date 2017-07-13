import _ from 'underscore'
import { colorConsole } from 'tracer'
const logger = colorConsole()

let isSleeping = false
let recentItemList = []
// timeCut 밀리세컨드안에 msgCut 개 이상의 메시지가 올경우 isSleeping = true 로 셋팅하고,
// false 가 될때까지 모든 대화를 씹음

let blackChannelList = ['tp4by6pbutnadpismox8xdim9c']
let blackUserList = []

const defaultOptions = {
  timeCut: 10 * 1000,
  msgCut: 10,
  delay: 700,         // 바로 말하지 않고 딜레이를 주어서 인간미를 심어줌
  type: 'send',
}

// Initialize to defaultOptions
let _options = { ...defaultOptions }

const createPost = (req, msg, delay=_options.delay, type='send') => {

  const { timeCut, msgCut } = _options

  if( isSleeping ) {
    // 씹는다
    return
  }

  // Check blackList channel
  if( blackChannelList.indexOf( req.envelope.room ) > -1 ) {
    logger.debug('msg block because blackList channel')
    logger.debug( msg )
    return
  }

  recentItemList = [
    { msg, cTime: Date.now() },
    ...recentItemList.slice(0,msgCut-1),
  ]

  const last = _.last( recentItemList )
  if( recentItemList.length >= msgCut && Date.now() - last.cTime < timeCut ) {
    setTimeout( () => req[type]('Prevented infinite loop, I will sleep for 12 sec'), 500 )
    isSleeping = true
    setTimeout( () => isSleeping = false, 12*1000 )
    return
  }

  setTimeout( () => req[type]( msg ), delay )
}

export const send = (req, msg, delay=_options.delay) => {
  createPost( req,msg,delay,'send')
}

export const reply = (req, msg, delay=_options.delay) => {
  createPost( req,msg,delay,'reply')
}

export const setOptions = ( customizedOptions={} ) => {
  _options = { ...defaultOptions, ..._options, ...customizedOptions }
}

export const addBlackChannel = ( id ) => {
  blackChannelList = [ ...blackChannelList, id ]
}

export const addBlackUser = ( id ) => {
  blackUserList = [ ...blackUserList, id ]
}

export const random = (list) => {
  return list[ Math.floor( Math.random()*list.length )]
}


export default exports
