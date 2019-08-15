const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const delay : number = 50
const textColor : string = "#f44336"

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.scale = 0
            this.prevScale = 1
            this.dir = 1
            cb()
        }
    }
}

class Animator {

    interval : number
    animated : boolean = false

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class TextBox {

    inputElement : HTMLInputElement = document.createElement('input')

    init() {
        this.inputElement.style.position = 'absolute'
        this.inputElement.style.top =  `${50}px`
        this.inputElement.style.width = `${w / 4}px`
        this.inputElement.style.left = `${w / 4 }px`
        this.inputElement.style.height = `${h / 10}px`
        document.body.appendChild(this.inputElement)
    }

    handleInput(cb : Function) {
        this.inputElement.onkeydown = (e) => {
            if (e.keyCode == 13) {
                this.setReadOnly(true)
                cb(this.inputElement.value)
            }
        }
    }

    setFocus() {
        this.inputElement.focus()
    }

    setReadOnly(flag) {
        if (flag) {
            this.inputElement.disabled = true
        } else {
            this.inputElement.removeAttribute('disabled')
        }
    }
}

class TextElement {

    span : HTMLSpanElement = document.createElement('span')
    state : State = new State()

    init(text : string) {
        this.span.innerText = text
        this.span.style.color = textColor
        this.span.style.position = 'absolute'
        this.span.style.fontSize = `${Math.min(w, h) / 6}px`
        this.span.style.top = `${h / 2 - Math.min(w, h) / 12}px`
        this.span.style.left = `${w}px`
        document.body.appendChild(this.span)
    }

    move(cb : Function, x1 : number, x2 : number) {
        const x : number = x1 + (x2 - x1) * this.state.scale
        this.span.style.left = `${x}px`
        this.state.update(cb)
    }

    moveOutOfScreen(cb : Function) {
        this.move(cb, w, w / 4)
    }

    moveToMiddle(cb : Function) {
        this.move(() => {
            document.body.removeChild(this.span)
            cb()
        }, w / 4, 0)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
}

class TextElementContainer {
    curr : TextElement = null
    prev : TextElement = null
    animator : Animator = new Animator()

    start(text : string) {
        const temp : TextElement = this.curr
        this.curr = new TextElement()
        this.curr.init(text)
        const currCb : Function = () => {
            this.curr.startUpdating(() => {
                this.animator.start(() => {
                    this.curr.moveToMiddle(() => {
                        this.animator.stop()
                    })
                })
            })
        }
        if (temp == null) {
            currCb()

        } else {
            this.prev = temp
            this.prev.startUpdating(() => {
                this.animator.start(() => {
                    this.prev.moveOutOfScreen(() => {
                        this.animator.stop()
                        currCb()
                    })
                })
            })
        }
    }
}
