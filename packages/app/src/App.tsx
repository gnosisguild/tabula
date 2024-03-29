import React, { useEffect, useState } from "react"
import { PublicationView } from "./components/views/publication/PublicationView"
import { Routes, Route } from "react-router-dom"
import { SnackbarProvider } from "notistack"
import { Provider as UrqlProvider } from "urql"
/** Views **/
import { LandingView } from "./components/views/home/LandingView"
import { WalletView } from "./components/views/wallet/WalletView"
import { PublicationsView } from "./components/views/publication/PublicationsView"
import { ArticleProvider, PublicationProvider } from "./services/publications/contexts"
import { CreateArticleView } from "./components/views/publication/CreateArticleView"
import { ArticleView } from "./components/views/publication/ArticleView"
import ScrollToTop from "./components/commons/ScrollToTop"
import { subgraphClient } from "./services/graphql"
import { PermissionView } from "./components/views/publication/PermissionView"
import { useWeb3React } from "@web3-react/core"
import { PosterProvider } from "./services/poster/context"
import { WalletProvider } from "./connectors/WalletProvider"
import { RedirectOldRoute } from "./components/commons/RedicrectOldRoute"
import PreviewArticleView from "./components/views/publication/PreviewArticleView"
import { EnsProvider } from "./services/ens/context"

const App: React.FC = () => {
  // the chainId should be from the publication if its present

  const { chainId: initialChainIdFromProvider } = useWeb3React() // chain id from connected wallet
  const [chainId, setChainId] = useState(initialChainIdFromProvider)
  const [currentSubgraphClient, setCurrentSubgraphClient] = useState(subgraphClient(chainId))

  const updateChainId = (newChainId: number | undefined) => {
    if (newChainId !== chainId) {
      setChainId(newChainId)
    }
  }

  useEffect(() => {
    setCurrentSubgraphClient(subgraphClient(chainId))
  }, [chainId])

  useEffect(() => {
    setChainId(initialChainIdFromProvider)
  }, [initialChainIdFromProvider])

  return (
    <SnackbarProvider maxSnack={1}>
      <UrqlProvider value={currentSubgraphClient}>
        <WalletProvider>
          <EnsProvider>
            <PublicationProvider>
              <ArticleProvider>
                <PosterProvider>
                  <ScrollToTop />
                  <Routes>
                    {" "}
                    <Route path="/" element={<LandingView />} />
                    <Route path="/wallet" element={<WalletView />} />
                    <Route path="/publications" element={<PublicationsView updateChainId={updateChainId} />} />
                    <Route path=":publicationSlug" element={<PublicationView updateChainId={updateChainId} />} />
                    {/* Redirect old routes to new routes */}
                    <Route path="/goerli/*" element={<RedirectOldRoute />} />
                    <Route path="/mainnet/*" element={<RedirectOldRoute />} />
                    <Route path="/gnosis_chain/*" element={<RedirectOldRoute />} />
                    <Route path="/polygon/*" element={<RedirectOldRoute />} />
                    <Route path="/arbitrum/*" element={<RedirectOldRoute />} />
                    <Route path="/optimism/*" element={<RedirectOldRoute />} />
                    {/* New routes */}
                    <Route path=":publicationSlug">
                      <Route path="permissions/:type" element={<PermissionView />} />

                      <Route path="new" element={<CreateArticleView type="new" />} />

                      <Route path=":type/preview" element={<PreviewArticleView />} />

                      <Route path=":articleId" element={<ArticleView updateChainId={updateChainId} />} />

                      <Route path=":articleId/edit" element={<CreateArticleView type="edit" />} />
                    </Route>
                  </Routes>
                </PosterProvider>
              </ArticleProvider>
            </PublicationProvider>
          </EnsProvider>
        </WalletProvider>
      </UrqlProvider>
    </SnackbarProvider>
  )
}

export default App
