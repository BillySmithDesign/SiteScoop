import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    axios.get('/api/check-payment').then(response => {
      setPaymentVerified(response.data.paid);
    });
  }, []);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentVerified) {
      setMessage('Please complete the payment first.');
      return;
    }

    setMessage('Starting download...');
    setDownloadLink('');

    try {
      const response = await axios.post('/api/download', { url });
      setMessage(response.data.message);
      setDownloadLink(response.data.downloadLink);
    } catch (error) {
      setMessage('An error occurred while downloading the website.');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>SiteScoop</h1>
        {!paymentVerified ? (
          <a href="/payment" className={styles.payLink}>Please make a payment to proceed</a>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Enter website URL"
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>Download</button>
            </form>
            <p className={styles.message}>{message}</p>
            {downloadLink && (
              <a href={downloadLink} className={styles.downloadLink} download>Download Your Site</a>
            )}
          </>
        )}
      </main>
    </div>
  );
}
