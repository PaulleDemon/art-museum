



export default class AnnotationDiv{

    constructor(text, id, onAnnotationClick, onAnnotationDblClick){

        this.__id = id

        this.annotationDiv = document.createElement('div');
        this.annotationDiv.className = 'annotation';
        this.annotationDiv.textContent = `${text}`;

        this.expandedDiv = document.createElement('div');
        this.expandedDiv.className = 'expanded-annotation';

        const uploadBtn = document.createElement("button")
        uploadBtn.textContent = "Upload";
        uploadBtn.classList.add("btn")
        uploadBtn.addEventListener("click", (event) => {
            this.onAnnotationClick({event: null, id: this.__id})
        })

        const container = document.createElement("div")
        container.style.width = "100%"
        container.style.height = "100%"
        container.style.display = "flex"
        container.style.alignItems = "center"
        container.style.justifyContent = "center"

        container.appendChild(uploadBtn)

        this.expandedDiv.appendChild(container)

        this.annotationDiv.appendChild(this.expandedDiv);

        this.onAnnotationClick = onAnnotationClick;
        this.onAnnotationDblClick = onAnnotationDblClick;

        this.annotationDiv.addEventListener("click", this.clickEvent.bind(this))

        this.annotationDiv.addEventListener("dblclick", this.dblClickEvent.bind(this))
    
        this.setAnnotationDetails = this.setAnnotationDetails.bind(this)
    
    }

    clickEvent(event){
        if (!this.expandedDiv.contains(event.target)){
            this.onAnnotationClick({event: event, id: this.__id})
        }
    }

    dblClickEvent(event){
        if (!this.expandedDiv.contains(event.target)){
            this.onAnnotationDblClick({event: event, id: this.__id})
        }
    }

    setAnnotationDetails(title, description, artist){

        this.expandedDiv.innerHTML = `
                <p class="art-title">${title}</p>
                <p class="art-description">${description}</p>
                <a class="twitter-acc" href="https://x.com/${artist}" target="_blank" rel="noopener noreferrer">@${artist}</a>
    `

    }

    getElement(){
        return this.annotationDiv
    }

    getId(){
        return this.__id
    }

}   
