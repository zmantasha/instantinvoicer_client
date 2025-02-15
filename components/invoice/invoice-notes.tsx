"use client";

import { Textarea } from "../../components/ui/textarea";
import React, { memo } from 'react';
interface InvoiceNotesProps {
  notes: string;
  terms: string;
  onUpdateNotes: (notes: string) => void;
  onUpdateTerms: (terms: string) => void;
}
const InvoiceNotes = memo(({ notes, terms, onUpdateNotes, onUpdateTerms }: InvoiceNotesProps) =>{
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Notes - any relevant information not already covered"
          className="min-h-[120px] resize-none"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Terms</h3>
        <Textarea
          value={terms}
          onChange={(e) => onUpdateTerms(e.target.value)}
          placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
          className="min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
});

InvoiceNotes.displayName = 'InvoiceNotes';
export { InvoiceNotes };