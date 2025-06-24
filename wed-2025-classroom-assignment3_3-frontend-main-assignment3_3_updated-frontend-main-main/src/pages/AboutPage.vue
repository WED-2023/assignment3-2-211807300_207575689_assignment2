<template>
  <div class="about-container">
    <div class="hero-section">
      <h1 class="main-title"> Vue Recipes אודות</h1>
      <p class="subtitle">פלטפורמה חדשנית לחיפוש, שיתוף ושמירת מתכונים</p>
    </div>

    <div class="content-wrapper">
      <!-- פרויקט -->
      <section class="project-section">
        <h2>אודות הפרויקט</h2>
        <div class="project-card">
          <p>
            Vue Recipes הוא פרויקט חדשני שפותח במסגרת לימודי הנדסת מערכות מידע. 
            האתר מאפשר למשתמשים לחפש מתכונים, לשתף מתכונים משלהם, לשמור מתכונים מועדפים 
            ולנהל אוסף מתכונים אישי ומשפחתי.
          </p>
          <p>
            הפרויקט נבנה בטכנולוגיות מתקדמות: Vue.js בצד הלקוח ו-Node.js עם Express בצד השרת,
            תוך שימוש במסד נתונים מתקדם לאחסון המידע.
          </p>
        </div>
      </section>

      <!-- צוות הפיתוח -->
      <section class="team-section">
        <h2>צוות הפיתוח - Code Queen</h2>
        <div class="team-description">
          <p>הדר, רוני ומאי - שלושתנו סטודנטיות במחלקה להנדסת מערכות מידע ותוכנה </p>
        </div>
        <div class="team-grid">
          <div class="developer-card">
            <div class="developer-avatar">
              <span class="avatar-text">R</span>
            </div>
            <h3>רוני </h3>
            <p class="role">מפתחת Full Stack</p>
            <p class="description">
              סטודנטית להנדסת מערכות מידע, מתמחה בפיתוח אפליקציות ווב מתקדמות 
              ובעיצוב חוויית משתמש אינטואיטיבית.
            </p>
          </div>

          <div class="developer-card">
            <div class="developer-avatar">
              <span class="avatar-text">H</span>
            </div>
            <h3>הדר</h3>
            <p class="role">מפתחת Full Stack</p>
            <p class="description">
              סטודנטית להנדסת מערכות מידע, מתמחה בפיתוח Backend מתקדם 
              ובארכיטקטורת מערכות מידע.
            </p>
          </div>

          <div class="developer-card">
            <div class="developer-avatar">
              <span class="avatar-text">M</span>
            </div>
            <h3>מאי</h3>
            <p class="role">מפתחת Full Stack</p>
            <p class="description">
              סטודנטית להנדסת מערכות מידע, מתמחה בפיתוח Frontend מתקדם 
              ובטכנולוגיות ווב חדשניות.
            </p>
          </div>
        </div>
      </section>

      <!-- טכנולוגיות -->
      <section class="tech-section">
        <h2>טכנולוגיות בפרויקט</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <h4>Frontend</h4>
            <ul>
              <li>Vue.js 3</li>
              <li>Vue Router</li>
              <li>SCSS</li>
              <li>Responsive Design</li>
            </ul>
          </div>
          <div class="tech-item">
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>RESTful API</li>
              <li>Database Integration</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- קישורים לפרויקטים קודמים -->
      <section class="projects-section">
        <h2>הפרויקטים הקודמים שלנו</h2>
        <div class="projects-grid">
          <a 
            href="https://may-s-l.github.io/shlomo-website/" 
            target="_blank" 
            class="project-link"
          >
            <div class="project-card-link">
              <h4>אתר של שלמה</h4>
              <p>פרויקט אתר אישי עם עיצוב מתקדם</p>
              <span class="link-arrow">→</span>
            </div>
          </a>

          <a 
            href="https://may-s-l.github.io/Clear-sky-game-webgame/" 
            target="_blank" 
            class="project-link"
          >
            <div class="project-card-link">
              <h4>Clear Sky Game</h4>
              <p>משחק אונליין אינטראקטיבי</p>
              <span class="link-arrow">→</span>
            </div>
          </a>

          <a 
            href="https://wed-2023.github.io/assignment2-211807300_207575689_assignment2/" 
            target="_blank" 
            class="project-link"
          >
            <div class="project-card-link">
              <h4>Space Shooter Game</h4>
              <p>פרויקט אקדמי - פיתוח web</p>
              <span class="link-arrow">→</span>
            </div>
          </a>

          <a 
            href="https://wed-2023.github.io/207575689/" 
            target="_blank" 
            class="project-link"
          >
            <div class="project-card-link">
              <h4>אריק איינשטיין</h4>
              <p>פרויקט פיתוח web מתקדם</p>
              <span class="link-arrow">→</span>
            </div>
          </a>

          <a 
            href="https://wed-2023.github.io/211807300/" 
            target="_blank" 
            class="project-link"
          >
            <div class="project-card-link">
              <h4>האתר של ממה </h4>
              <p>פרויקט פיתוח web נוסף</p>
              <span class="link-arrow">→</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  mounted() {
    // אפשר להוסיף כאן לוגיקה אם צריך
    document.title = 'Vue Recipes - About';
  }
}
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-section {
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  color: white;
  text-align: center;
  padding: 80px 20px;
  
  .main-title {
    font-size: 3rem;
    margin-bottom: 20px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

section {
  margin-bottom: 60px;
  
  h2 {
    font-size: 2.2rem;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    
    &::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: #42b983;
      margin: 15px auto;
      border-radius: 2px;
    }
  }
}

.project-section {
  .project-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    line-height: 1.8;
    font-size: 1.1rem;
    text-align: right;
    direction: rtl;
    
    p {
      margin-bottom: 20px;
      color: #555;
    }
  }
}

.team-section {
  .team-description {
    text-align: center;
    margin-bottom: 30px;
    
    p {
      font-size: 1.2rem;
      color: #555;
      font-weight: 500;
      direction: rtl;
    }
  }
  
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;
  }
  
  .developer-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease;
    direction: rtl;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .developer-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #42b983, #369870);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      
      .avatar-text {
        color: white;
        font-size: 2rem;
        font-weight: bold;
      }
    }
    
    h3 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .role {
      color: #42b983;
      font-weight: 600;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }
    
    .description {
      color: #666;
      line-height: 1.6;
    }
  }
}

.tech-section {
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .tech-item {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    
    h4 {
      color: #42b983;
      font-size: 1.3rem;
      margin-bottom: 20px;
      text-align: center;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        color: #555;
        
        &:last-child {
          border-bottom: none;
        }
        
        &::before {
          content: '✓';
          color: #42b983;
          font-weight: bold;
          margin-right: 10px;
        }
      }
    }
  }
}

.projects-section {
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .project-link {
    text-decoration: none;
    color: inherit;
    
    .project-card-link {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        
        .link-arrow {
          transform: translateX(5px);
        }
      }
      
      h4 {
        color: #2c3e50;
        font-size: 1.3rem;
        margin-bottom: 15px;
      }
      
      p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      
      .link-arrow {
        position: absolute;
        bottom: 20px;
        right: 25px;
        font-size: 1.5rem;
        color: #42b983;
        transition: transform 0.3s ease;
      }
    }
  }
}

.contact-section {
  text-align: center;
  background: white;
  padding: 50px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  
  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 30px;
    line-height: 1.8;
  }
  
  .contact-info {
    .team-name {
      display: inline-block;
      background: linear-gradient(135deg, #42b983, #369870);
      color: white;
      padding: 15px 30px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1.2rem;
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px;
    
    .main-title {
      font-size: 2.2rem;
    }
  }
  
  .content-wrapper {
    padding: 40px 15px;
  }
  
  section h2 {
    font-size: 1.8rem;
  }
  
  .team-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>