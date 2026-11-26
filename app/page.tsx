<style>{`
  body {
    background: #f7f9ff;
  }

  .bar {
    max-width: 1180px;
    margin: 18px auto;
    padding: 15px 24px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 5px 25px rgba(15,23,42,.05);
  }

  main {
    max-width: 1180px;
    margin: auto;
    padding: 25px 22px 60px;
  }

  main section:first-child {
    padding: 85px 25px 75px !important;
    border-radius: 30px;
    background:
      radial-gradient(circle at 85% 20%, rgba(59,130,246,.18), transparent 30%),
      linear-gradient(135deg,#101b36,#172e59);
    color: white;
    overflow: hidden;
  }

  main section:first-child h1 {
    max-width: 850px;
    margin: 24px auto !important;
    font-size: clamp(35px,5vw,58px) !important;
    line-height: 1.12;
    font-weight: 850;
    letter-spacing: -1.8px;
  }

  main section:first-child p {
    max-width: 680px;
    margin: auto;
    color: #d5def2;
    line-height: 1.8;
  }

  main section {
    margin-top: 65px !important;
  }

  main h2 {
    font-size: clamp(25px,3vw,36px);
    font-weight: 800;
    letter-spacing: -.8px;
    line-height: 1.2;
    margin: 15px 0 25px;
  }

  main .card {
    border: 1px solid #e8edf5;
    border-radius: 20px;
    background: white;
    box-shadow: 0 8px 30px rgba(15,23,42,.035);
  }

  main .offers {
    gap: 20px;
  }

  main .offers > .card {
    padding: 27px;
    transition: transform .2s, box-shadow .2s;
  }

  main .offers > .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 40px rgba(15,23,42,.09);
  }

  main .pill {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 30px;
    background: #eaf1ff;
    color: #2563eb;
    font-weight: 750;
    font-size: 12px;
    letter-spacing: .4px;
  }

  main .btn {
    border-radius: 12px;
    font-weight: 750;
  }

  main .hero {
    background: linear-gradient(130deg,#14264b,#2563eb);
    border: none;
    box-shadow: 0 18px 45px rgba(37,99,235,.18);
  }

  main .faq details {
    padding: 17px 5px;
    border-bottom: 1px solid #edf0f5;
  }

  main .faq summary {
    font-weight: 750;
    cursor: pointer;
  }

  footer {
    border-top: 1px solid #e8edf5;
    background: white;
  }

  @media(max-width:650px) {
    main {
      padding: 12px 15px 40px;
    }

    main section:first-child {
      padding: 60px 18px !important;
      border-radius: 22px;
    }

    main section:first-child h1 {
      font-size: 36px !important;
    }

    main section {
      margin-top: 45px !important;
    }
  }
`}</style>
