import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import Quiz from './components/Quiz.vue'
import QuizOption from './components/QuizOption.vue'
import QuizExplanation from './components/QuizExplanation.vue'
import Mermaid from './components/Mermaid.vue'
import ConceptList from './components/ConceptList.vue'
import ConceptIndex from './components/ConceptIndex.vue'
import ProgressDashboard from './components/ProgressDashboard.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Quiz', Quiz)
    app.component('QuizOption', QuizOption)
    app.component('QuizExplanation', QuizExplanation)
    app.component('Mermaid', Mermaid)
    app.component('ConceptList', ConceptList)
    app.component('ConceptIndex', ConceptIndex)
    app.component('ProgressDashboard', ProgressDashboard)
  },
}
