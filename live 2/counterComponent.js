(() => {
    const BTN_RESTART = '#btn-restart'
    const COUNTER_ID = '#counter'
    const COUNTER_VALUE = 100
    const INTERVAL_TIME = 10
    
    class CounterComponent{
        constructor(){
            this.initialize()
        }
    
        setUpCounterProxy(){
            const handler = {
                set: (currentContext, propertyKey, newValue) => {
                    currentContext[propertyKey] = newValue
    
                    if(currentContext.value < 0){
                        currentContext.stopCounter()
                    }
    
                    return true
                }
            }
    
            const counter = new Proxy({
                value: COUNTER_VALUE,
                stopCounter: () => {}
            }, handler)
    
            return counter
        }
    
        updateText({ counterElement, counter }){
            return () => {
                const textID = '$$counter'
                const defaultText = `Começando em <strong>${textID}</strong> segundos...`
        
                counterElement.innerHTML = defaultText.replace(textID, counter.value--)
            }
        }
     
        scheduleCounterStop({ counterElement, intervalID }){
            return () => {
                clearInterval(intervalID)
    
                counterElement.innerHTML = ''
    
                this.disableButton(false)
            }
        }
    
        setUpButton(buttonElement, initializeFn){
            buttonElement.addEventListener('click', initializeFn.bind(this))
    
            return (value = true) => {
                const attr = 'disabled'

                buttonElement.removeEventListener('click', initializeFn.bind(this))
    
                if(value){
                    buttonElement.setAttribute(attr, true)
    
                    return
                }
    
                buttonElement.removeAttribute(attr)    
            }
        }
    
        initialize(){
            const counterElement = document.querySelector(COUNTER_ID)
            const counter = this.setUpCounterProxy()
            const args = { counterElement, counter }
    
            const fn = this.updateText(args)
    
            const intervalID = setInterval(fn, INTERVAL_TIME)
    
            {
                const buttonElement = document.querySelector(BTN_RESTART)
                const disableButton = this.setUpButton(buttonElement, this.initialize)
    
                disableButton()
    
                const args = { counterElement, intervalID }
    
                const stopCounter = this.scheduleCounterStop.apply({ disableButton }, [ args ])
    
                counter.stopCounter = stopCounter
            }
        }
    }

    window.CounterComponent = CounterComponent
})()

export default window.CounterComponent

