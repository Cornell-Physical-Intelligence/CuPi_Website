import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getPageFromPath, normalizeLegacyHash, PAGE_LOADERS } from './routes'

normalizeLegacyHash()

// Resolve the page being landed on before the first render, rather than letting a Suspense
// boundary discover it afterwards.
//
// Splitting the routes is what makes each page light, but behind `React.lazy` it also
// means React renders the shell, suspends, resolves a module, and renders again — and the
// page's own content only exists in that second pass. On the roster that moved the largest
// paint from 296ms to 532ms even with the module already fetched: the delay was never the
// download, it was the extra render. Awaiting the module here collapses it back to one
// pass, and costs nothing, because the chunk is already in flight from the modulepreload
// the build wrote into this route's HTML.
//
// Home has no loader and no await; it is in this chunk already.
const initialPage = getPageFromPath()
const loadInitial = PAGE_LOADERS[initialPage]
const InitialPage = loadInitial ? (await loadInitial()).default : null

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App initialPage={initialPage} InitialPage={InitialPage} />
  </StrictMode>,
)
