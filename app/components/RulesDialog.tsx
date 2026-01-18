import { useTranslations } from 'next-intl'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface RulesDialogProps {
  children: React.ReactNode
}

export const RulesDialog: React.FC<RulesDialogProps> = ({ children }) => {
  const t = useTranslations('Sidebar')

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('rulesTitle')}</DialogTitle>
          <DialogDescription className="pt-2">
            {t('rulesIntro')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t('rulesContext')}
          </p>
          <ul className="list-disc pl-6 space-y-3 text-sm text-muted-foreground">
            <li>{t('rule1')}</li>
            <li>{t('rule2')}</li>
            <li>{t('rule3')}</li>
            <li>{t('rule4')}</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
