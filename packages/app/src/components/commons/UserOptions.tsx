import { Avatar, Grid, Paper, styled, Stack, Typography, Divider, Tooltip } from "@mui/material"
import React, { useState } from "react"
import { palette, typography } from "../../theme"
import PushPinIcon from "@mui/icons-material/PushPin"
import CopyIcon from "@mui/icons-material/CopyAllOutlined"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
// import EditIcon from "@mui/icons-material/Edit"
import NodeIcon from "../../assets/images/icons/node"

import { useWeb3React } from "@web3-react/core"
import { useNavigate } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import IPFSNodeModal from "./IPFSNodeModal"
import { useNotification } from "../../hooks/useNotification"
import { chainIdToChainName, SupportedChainIcon } from "../../constants/chain"
import { shortAddress } from "../../utils/string-handler"
import PinningConfigurationModal from "./PinningConfigurationModal"

const UserOptionsContainer = styled(Paper)({
  padding: 8,
  borderRadius: "8px !important",
  boxShadow: `0 4px 16px rgba(0,0,0,0.05)`,
  zIndex: 2,
  "&:before": {
    content: "none",
  },
})

const MenuItem = styled(Grid)({
  borderRadius: 4,
  padding: 8,
  "&:hover": {
    backgroundColor: palette.grays[50],
  },
})

type UserOptionProps = {
  onClose: () => void
}
export const UserOptions: React.FC<UserOptionProps> = ({ onClose }) => {
  const { account, chainId, deactivate } = useWeb3React()
  const [showIPFSModal, setShowIPFSModal] = useState<boolean>(false)
  const [showSettingModal, setShowSettingModal] = useState<boolean>(false)
  const [walletAutoConnect, setWalletAutoConnect] = useLocalStorage<boolean | undefined>("walletAutoConnect", undefined)
  const navigate = useNavigate()
  const openNotification = useNotification()

  let chainName
  const getChainInfo = (chain_id: number) => {
    const chainNameArray = chainIdToChainName(chain_id)?.split("_")
    if (chainNameArray) {
      for (let i = 0; i < chainNameArray.length; i++) {
        chainNameArray[i] = chainNameArray[i].charAt(0).toUpperCase() + chainNameArray[i].slice(1)
      }
      chainName = chainNameArray?.join(" ")
    }
  }

  const handleAddressCopy = async (account: string) => {
    navigator.clipboard.writeText(account)

    openNotification({
      message: "Address copied to clipboard",
      variant: "success",
    })
  }

  if (chainId) {
    getChainInfo(chainId)
  }

  return (
    <UserOptionsContainer>
      {chainId && account && (
        <MenuItem
          item
          sx={{ cursor: "pointer" }}
          onClick={() => {
            handleAddressCopy(account)
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip placement="top" title={`Connected to ${chainName}`}>
                <Stack sx={{ width: 24, height: 24 }}>
                  <img src={SupportedChainIcon(chainId)} alt={chainName} />
                </Stack>
              </Tooltip>
              <Tooltip
                placement="top"
                title={
                  <Typography
                    sx={{ fontFamily: typography.fontFamilies.monospace, fontSize: 10, whiteSpace: "nowrap" }}
                  >
                    {account}
                  </Typography>
                }
              >
                <Typography
                  sx={{ fontFamily: typography.fontFamilies.monospace, whiteSpace: "nowrap" }}
                  variant="body2"
                >
                  {shortAddress(account).toLowerCase()}
                </Typography>
              </Tooltip>
            </Stack>
            <CopyIcon sx={{ color: palette.grays[800], width: 12 }} />
          </Stack>
        </MenuItem>
      )}

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        item
        sx={{ cursor: "pointer" }}
        onClick={() => {
          setShowSettingModal(true)
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, background: palette.grays[100] }}>
            <PushPinIcon sx={{ color: palette.grays[800], width: 16 }} />
          </Avatar>
          <Typography sx={{ fontFamily: typography.fontFamilies.sans, whiteSpace: "nowrap" }} variant="body2">
            Update Pinning Service
          </Typography>
        </Stack>
      </MenuItem>

      <MenuItem
        item
        sx={{ cursor: "pointer" }}
        onClick={() => {
          setShowIPFSModal(!showIPFSModal)
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <NodeIcon sx={{ color: palette.grays[800], width: 24 }} />
          <Typography sx={{ fontFamily: typography.fontFamilies.sans, whiteSpace: "nowrap" }} variant="body2">
            Update IPFS Node
          </Typography>
        </Stack>
      </MenuItem>

      <MenuItem
        item
        sx={{ cursor: "pointer" }}
        onClick={() => {
          navigate(`/publications`)
          onClose()
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, background: palette.grays[100] }}>
            <ExitToAppIcon sx={{ color: palette.grays[800], width: 16 }} />
          </Avatar>
          <Typography sx={{ fontFamily: typography.fontFamilies.sans, whiteSpace: "nowrap" }} variant="body2">
            Switch Publication
          </Typography>
        </Stack>
      </MenuItem>

      <MenuItem
        item
        sx={{ cursor: "pointer" }}
        onClick={() => {
          if (walletAutoConnect) {
            setWalletAutoConnect(undefined)
          }
          deactivate()
          onClose()
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, background: palette.grays[100] }}>
            <LinkOffIcon sx={{ color: palette.primary[800], width: 16 }} />
          </Avatar>
          <Typography
            sx={{ fontFamily: typography.fontFamilies.sans, whiteSpace: "nowrap" }}
            variant="body2"
            color={palette.primary[1000]}
          >
            Disconnect Wallet
          </Typography>
        </Stack>
      </MenuItem>

      <IPFSNodeModal
        open={showIPFSModal}
        onClose={() => {
          setShowIPFSModal(false)
          onClose()
        }}
      />
      <PinningConfigurationModal
        open={showSettingModal}
        onClose={() => {
          setShowSettingModal(false)
          onClose()
        }}
      />
    </UserOptionsContainer>
  )
}
