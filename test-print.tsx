import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

function Test() {
  const ref = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: ref });
  console.log(handlePrint);
}
