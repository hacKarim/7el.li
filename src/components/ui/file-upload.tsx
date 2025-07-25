'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FileItem = any

// Import FilePond styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

// Import plugins
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'

// Register plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize,
)

interface FileUploadProps {
  value?: File[]
  onValueChange?: (files: File[]) => void
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
      onError: (file: File, error: Error) => void
    },
  ) => Promise<void> | void
  accept?: string
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  name?: string
  required?: boolean
  allowImagePreview?: boolean
  imagePreviewHeight?: number
  dropValidation?: boolean
  allowReorder?: boolean
  allowRevert?: boolean
  server?: string | object
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      value = [],
      onValueChange,
      onUpload,
      accept,
      maxFiles = 10,
      maxSize,
      multiple = true,
      disabled = false,
      className,
      name,
      required = false,
      allowImagePreview = true,
      imagePreviewHeight = 256,
      dropValidation = true,
      allowReorder = true,
      allowRevert = true,
      server,
      ...props
    },
    ref,
  ) => {
    const [files, setFiles] = React.useState<FileItem[]>([])

    // Convert File objects to FilePond format
    React.useEffect(() => {
      if (value && value.length > 0) {
        const filePondFiles = value.map((file) => ({
          source: file,
          options: {
            type: 'local',
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
          },
        }))
        setFiles(filePondFiles)
      } else {
        setFiles([])
      }
    }, [value])

    const handleUpdateFiles = React.useCallback(
      (fileItems: FileItem[]) => {
        setFiles(fileItems)

        // Convert FilePond format back to File objects
        const actualFiles = fileItems
          .map((fileItem) => fileItem.file)
          .filter(Boolean) as File[]

        onValueChange?.(actualFiles)
      },
      [onValueChange],
    )

    // Configure FilePond server if upload handler is provided
    const serverConfig = React.useMemo(() => {
      if (server) {
        return server
      }

      if (onUpload) {
        return {
          process: (
            _: string,
            file: File,
            __: object,
            load: (id?: string) => void,
            error: (message: string) => void,
            progress: (
              computable: boolean,
              loaded: number,
              total: number,
            ) => void,
            abort: () => void,
          ) => {
            onUpload([file], {
              onProgress: (_, progressValue) => {
                progress(true, progressValue, 100)
              },
              onSuccess: () => {
                load(file.name)
              },
              onError: (_, err) => {
                error(err.message)
              },
            })

            return {
              abort: () => {
                abort()
              },
            }
          },
        }
      }

      return undefined
    }, [server, onUpload])

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <FilePond
          files={files}
          onupdatefiles={handleUpdateFiles}
          allowMultiple={multiple}
          allowReorder={allowReorder}
          allowRevert={allowRevert}
          maxFiles={maxFiles}
          maxFileSize={maxSize ? maxSize.toString() : undefined}
          dropValidation={dropValidation}
          name={name}
          required={required}
          disabled={disabled}
          server={serverConfig}
          acceptedFileTypes={accept ? accept.split(',') : undefined}
          allowImagePreview={allowImagePreview}
          imagePreviewHeight={imagePreviewHeight}
          labelIdle='<div class="cursor-pointer flex hover:scale-105 transition-all hover:gap-1"><div class="border-muted-foreground/20 dark:bg-muted/80 a z-10 flex aspect-[3/4] w-24 origin-top-right -rotate-[5deg] scale-90 -translate-x-10 translate-y-5 flex-col gap-y-1 rounded-lg border bg-white/80 px-2 py-4 backdrop-blur-sm" style="transform: translateX(40px) translateY(-10px) rotate(-14deg) translateZ(0px);"><div class="bg-muted-foreground/20  h-2 w-full rounded-[2px]"></div><div class="bg-muted-foreground/20  h-2 w-5/6 rounded-[2px]"></div><div class="bg-muted-foreground/20  h-2 w-full rounded-[2px]"></div></div><div class="border-muted-foreground/20  dark:bg-muted/80 z-20 flex aspect-[3/4] w-24 flex-col items-center justify-center gap-y-1 rounded-lg border bg-white/80 px-2 py-4 backdrop-blur-sm" style="transform: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2px" stroke-linecap="round" stroke-linejoin="round" class="text-primary/30 h-12 w-12"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></div><div class="border-muted-foreground/20  dark:bg-muted/80 z-10 flex aspect-[3/4] w-24 origin-top-left rotate-[5deg] scale-95 translate-x-10 translate-y-4 flex-col gap-y-1 rounded-lg border bg-white/80 px-2 py-4 backdrop-blur-sm" style="transform: translateX(-40px) translateY(-10px) rotate(14deg) translateZ(0px);"><div class="bg-muted-foreground/20  h-2 w-full rounded-[2px]"></div><div class="bg-muted-foreground/20  h-2 w-5/6 rounded-[2px]"></div><div class="bg-muted-foreground/20  h-2 w-full rounded-[2px]"></div></div></div><div class="text-sm! text-muted-foreground pt-10">Drag & Drop your files or <span class="filepond--label-action">Browse</span></div>'
          labelInvalidField="Field contains invalid files"
          labelFileWaitingForSize="Waiting for size"
          labelFileSizeNotAvailable="Size not available"
          labelFileLoading="Loading"
          labelFileLoadError="Error during load"
          labelFileProcessing="Uploading"
          labelFileProcessingComplete="Upload complete"
          labelFileProcessingAborted="Upload cancelled"
          labelFileProcessingError="Error during upload"
          labelFileProcessingRevertError="Error during revert"
          labelFileRemoveError="Error during remove"
          labelTapToCancel="tap to cancel"
          labelTapToRetry="tap to retry"
          labelTapToUndo="tap to undo"
          labelButtonRemoveItem="Remove"
          labelButtonAbortItemLoad="Abort"
          labelButtonRetryItemLoad="Retry"
          labelButtonAbortItemProcessing="Cancel"
          labelButtonUndoItemProcessing="Undo"
          labelButtonRetryItemProcessing="Retry"
          labelButtonProcessItem="Upload"
        />
      </div>
    )
  },
)

FileUpload.displayName = 'FileUpload'

export { FileUpload }
export type { FileUploadProps }
