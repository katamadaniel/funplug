// FAQ.js
import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'Who are we?',
    answer: 'We are an events management platform where celebrities, event organizers and vendors in the events industry can converge for a seemless planning and sales experience.'
  },
  {
    question: 'Who is this platform for?',
    answer: 'This platform is for everyone looking for events or venues for their events as well as vendor services where we connect you to all the available vendors.'
  },
  {
    question: 'What do we do?',
    answer: 'We provide venors in the events space a platform to connect with clients, showcase, sell & get bookings for their services and products while managing thier transactions.'
  },
  {
    question: 'Do we charge to open or mentain an account?',
    answer: 'No we do not, creating and running an account is free. We only take a small percentage of the revenue generated through transactions on our platform as a service charge.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
          <h3>We know you have questions and we're here to answer them!</h3>

      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <button className="faq-question" onClick={() => toggleFAQ(index)}>
            {faq.question}
            <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
          </button>
          {openIndex === index && <div className="faq-answer">{faq.answer}</div>}
        </div>
      ))}
    </div>
  );
};

export default FAQ;
