import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExportFormatInfoProps {
  format: "png" | "svg" | "pdf"
}

export default function ExportFormatInfo({ format }: ExportFormatInfoProps) {
  const formatInfo = {
    png: "高品質の画像形式。ウェブサイトやSNSでの共有に最適。",
    svg: "拡大縮小可能なベクター形式。高品質の印刷に最適。",
    pdf: "文書形式。印刷やプロフェッショナルな共有に最適。",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center ml-1" aria-label={`${format}形式についての情報`}>
            <Info className="h-3 w-3 text-gray-500" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white text-xs p-3 rounded-none">
          <p>{formatInfo[format]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
