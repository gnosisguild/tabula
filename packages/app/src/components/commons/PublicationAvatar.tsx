import { Avatar, Badge, Stack } from "@mui/material"
import { styled } from "@mui/styles"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { palette, typography } from "../../theme"
import AddIcon from "@mui/icons-material/Add"
import ClearIcon from "@mui/icons-material/Clear"
import { useIpfs } from "../../hooks/useIpfs"

const SmallAvatar = styled(Avatar)({
  width: 40,
  height: 40,
  border: `2px solid ${palette.secondary[400]}`,
  cursor: "pointer",
})

type PublicationAvatarProps = {
  skipIPFSValidation?: boolean
  defaultImage?: string | null | undefined
  onFileSelected: (file: File) => void
}

const PublicationAvatar: React.FC<PublicationAvatarProps> = ({ skipIPFSValidation, defaultImage, onFileSelected }) => {
  const [file, setFile] = useState<File>()
  const inputFile = useRef<HTMLInputElement | null>(null)
  const openImagePicker = () => inputFile && inputFile.current?.click()
  const [removeImage, setRemoveImage] = useState<boolean>(false)
  const [uri, setUri] = useState<string>()
  const [defaultImageSrc, setDefaultImageSrc] = useState<string>("")
  const ipfs = useIpfs()

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader()
      reader.onload = (e) => {
        setUri(e.target?.result as string)
      }
      setFile(event.target.files[0])
      reader.readAsDataURL(event.target.files[0])
    }
  }

  useEffect(() => {
    if (file) {
      onFileSelected(file)
      setRemoveImage(false)
    }
  }, [file, onFileSelected])

  useEffect(() => {
    const getDefaultImageSrc = async () => {
      if (defaultImage && !skipIPFSValidation) {
        const src = await ipfs.getImgSrc(defaultImage)
        setDefaultImageSrc(src)
      }
      if (defaultImage && skipIPFSValidation) {
        setDefaultImageSrc(defaultImage)
      }
    }
    if (defaultImage != null && defaultImageSrc === "" && !removeImage) {
      getDefaultImageSrc()
    }
  }, [defaultImage, ipfs, defaultImageSrc, removeImage, skipIPFSValidation])

  const handlerImageAction = () => {
    if (!uri && (!defaultImage || removeImage)) {
      return openImagePicker()
    }
    if (uri || defaultImage) {
      setUri(undefined)
      setDefaultImageSrc("")
      setRemoveImage(true)
    }
  }

  return (
    <Stack direction="row" spacing={2}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <SmallAvatar
            sx={{
              bgcolor: palette.primary[1000],
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#B34A03",
              },
            }}
            onClick={handlerImageAction}
          >
            {!uri && (!defaultImage || removeImage) && <AddIcon />}
            {(uri || defaultImage) && !removeImage && <ClearIcon />}
            <input type="file" id="file" ref={inputFile} hidden accept="image/*" onChange={handleImage} />
          </SmallAvatar>
        }
      >
        <Avatar
          src={uri ? uri : defaultImageSrc}
          onClick={openImagePicker}
          sx={{
            width: 160,
            height: 160,
            bgcolor: "#f3f3f3",
            border: 4,
            borderColor: palette.grays[200],
            color: palette.grays[400],
            textAlign: "center",
            fontSize: 14,
            fontFamily: typography.fontFamilies.sans,
            cursor: "pointer",
            "&:hover": {
              bgcolor: palette.grays[100],
            },
          }}
        >
          Add a <br />
          publication image.
        </Avatar>
      </Badge>
    </Stack>
  )
}

export default PublicationAvatar
