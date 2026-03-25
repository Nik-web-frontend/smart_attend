import {React, useState} from 'react'

import FacultyNavbar from '../components/FacultyNavbar'
import UploadTimetable from '../components/UploadTimetable'
import AutoQR from '../components/AutoQr'


const UploadAutoQr = () => {
  const [refreshQR, setRefreshQR] = useState(false);

  return (
    <>
        <FacultyNavbar/>
      <UploadTimetable setRefreshQR={setRefreshQR} />
      <AutoQR refreshQR={refreshQR} />
 
    </>
  )
}

export default UploadAutoQr