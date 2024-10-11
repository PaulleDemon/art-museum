



export default class AnnotationDiv{

    constructor(text, id, onAnnotationClick, onAnnotationDblClick){

        this.__id = id

        this.annotationDiv = document.createElement('div');
        this.annotationDiv.className = 'annotation';
        this.annotationDiv.textContent = `${text}`;

        this.expandedDiv = document.createElement('div');
        this.expandedDiv.className = 'expanded-annotation';

        this.annotationDiv.appendChild(this.expandedDiv);

        this.onAnnotationClick = onAnnotationClick;
        this.onAnnotationDblClick = onAnnotationDblClick;

        this.annotationDiv.addEventListener("click", this.clickEvent.bind(this))

        this.annotationDiv.addEventListener("dblclick", this.dblClickEvent.bind(this))
    
        
    
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

    annotationDetails(description, title, artist){

        this.expandedDiv.innerHTML = `
            <div class="">
                <p class="art-title">${title}</p>
                <p class="art-description">${description}</p>
                <a class="twitter-acc" href="https://x.com/${artist}" target="_blank" rel="noopener noreferrer">@${artist}</a>
            </div>
    `

    }

    getElement(){
        return this.annotationDiv
    }

    getId(){
        return this.__id
    }

}   
