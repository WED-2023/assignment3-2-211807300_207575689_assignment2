<template>
  <div class="about-container">
    <div class="about-header">
      <h1>אודות</h1>
      <p>פלטפורמה חדשנית לחיפוש, שיתוף ושמירת מתכונים</p>
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
          <a href="https://may-s-l.github.io/shlomo-website/" target="_blank" class="project-link">
            <div class="project-card-link">
              <h4>אתר של שלמה</h4>
              <p>פרויקט אתר אישי עם עיצוב מתקדם</p>
              <span class="link-arrow">→</span>
            </div>
          </a>
          <a href="https://may-s-l.github.io/Clear-sky-game-webgame/" target="_blank" class="project-link">
            <div class="project-card-link">
              <h4>Clear Sky Game</h4>
              <p>משחק אונליין אינטראקטיבי</p>
              <span class="link-arrow">→</span>
            </div>
          </a>
          <a href="https://wed-2023.github.io/assignment2-211807300_207575689_assignment2/" target="_blank" class="project-link">
            <div class="project-card-link">
              <h4>Space Shooter Game</h4>
              <p>פרויקט אקדמי - פיתוח web</p>
              <span class="link-arrow">→</span>
            </div>
          </a>
          <a href="https://wed-2023.github.io/207575689/" target="_blank" class="project-link">
            <div class="project-card-link">
              <h4>אריק איינשטיין</h4>
              <p>פרויקט פיתוח web מתקדם</p>
              <span class="link-arrow">→</span>
            </div>
          </a>
          <a href="https://wed-2023.github.io/211807300/" target="_blank" class="project-link">
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
    document.title = 'Vue Recipes - About';
  }
};
</script>

<style scoped lang="scss">
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.about-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg,  #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.about-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.about-header p {
    font-size: 1.1rem;
    opacity: 0.95;
  }


.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  direction: rtl;
}

section {
  margin-bottom: 60px;

  h2 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    color: #2c3e50;

    &::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: #42b983;
      margin: 15px auto 0;
      border-radius: 2px;
    }
  }
}

.project-card,
.developer-card,
.tech-item,
.project-card-link {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.team-grid,
.tech-grid,
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
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

.project-link {
  text-decoration: none;
  color: inherit;

  .project-card-link {
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    h4 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    p {
      color: #666;
    }

    .link-arrow {
      float: left;
      font-size: 1.5rem;
      color: #42b983;
    }
  }
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2rem;
  }

  .content-wrapper {
    padding: 15px;
  }
}
</style>
