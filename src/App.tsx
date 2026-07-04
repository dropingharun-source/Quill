import { Sidebar } from './components/Sidebar'
import { ChapterDetail } from './pages/ChapterDetail'
import { IeltsLog } from './pages/IeltsLog'
import { PastPages } from './pages/PastPages'
import { Today } from './pages/Today'
import { QuillProvider, useQuill } from './store/QuillContext'
import styles from './App.module.css'

function Shell() {
  const { route, chapters } = useQuill()

  let view = <Today />
  if (route.view === 'chapter' && chapters.some((c) => c.id === route.chapterId)) {
    view = <ChapterDetail key={route.chapterId} chapterId={route.chapterId} />
  } else if (route.view === 'ielts') {
    view = <IeltsLog />
  } else if (route.view === 'pages') {
    view = <PastPages />
  }

  return (
    <div className={styles.canvas}>
      <div className={styles.shell}>
        <Sidebar />
        <main className={styles.main}>{view}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QuillProvider>
      <Shell />
    </QuillProvider>
  )
}
